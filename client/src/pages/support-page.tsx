import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, Send, Clock, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

// Types
interface SupportChat {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  lastMessageAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface SupportMessage {
  id: string;
  message: string;
  isAdminReply: boolean;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
  };
}

interface ChatWithMessages extends SupportChat {
  messages: SupportMessage[];
}

// Form schemas
const createChatSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const sendMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type CreateChatForm = z.infer<typeof createChatSchema>;
type SendMessageForm = z.infer<typeof sendMessageSchema>;

export default function SupportPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // WebSocket for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Connected to support chat WebSocket');
      if (selectedChatId) {
        socket.send(JSON.stringify({
          type: 'subscribe_chat',
          chatId: selectedChatId
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_support_message') {
          // Invalidate queries to refresh messages
          queryClient.invalidateQueries({ queryKey: ['/api/support/chats'] });
          if (data.chatId === selectedChatId) {
            queryClient.invalidateQueries({ queryKey: ['/api/support/chats', data.chatId] });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = () => {
      console.error('WebSocket connection error');
    };

    return () => {
      socket.close();
    };
  }, [selectedChatId, queryClient]);

  // Queries
  const { data: chats = [], isLoading: chatsLoading } = useQuery<SupportChat[]>({
    queryKey: ['/api/support/chats'],
  });

  const { data: selectedChat, isLoading: chatLoading } = useQuery<ChatWithMessages>({
    queryKey: ['/api/support/chats', selectedChatId],
    enabled: !!selectedChatId,
  });

  // Mutations
  const createChatMutation = useMutation({
    mutationFn: async (data: CreateChatForm) => {
      return apiRequest("POST", "/api/support/chats", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats'] });
      createForm.reset();
      setIsCreateDialogOpen(false);
      toast({
        title: "Support ticket created",
        description: "Your support request has been submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      return apiRequest("POST", `/api/support/chats/${chatId}/messages`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Forms
  const createForm = useForm<CreateChatForm>({
    resolver: zodResolver(createChatSchema),
    defaultValues: {
      subject: "",
      priority: "normal",
      message: "",
    },
  });

  const messageForm = useForm<SendMessageForm>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  const onCreateChat = (data: CreateChatForm) => {
    createChatMutation.mutate(data);
  };

  const onSendMessage = (data: SendMessageForm) => {
    if (selectedChatId) {
      sendMessageMutation.mutate({
        chatId: selectedChatId,
        message: data.message,
      });
      messageForm.reset();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chat List */}
        <div className="lg:w-1/3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Support Tickets
              </CardTitle>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-new-ticket">
                    <Plus className="h-4 w-4" />
                    New Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateChat)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Describe your issue briefly" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your issue in detail"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createChatMutation.isPending}
                        data-testid="button-submit-ticket"
                      >
                        {createChatMutation.isPending ? "Creating..." : "Create Ticket"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {chatsLoading ? (
                  <div className="text-center py-4">Loading tickets...</div>
                ) : chats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No support tickets yet</p>
                    <p className="text-sm">Create your first ticket to get help</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedChatId === chat.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:bg-muted'
                        }`}
                        onClick={() => setSelectedChatId(chat.id)}
                        data-testid={`chat-item-${chat.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{chat.subject}</h4>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 ml-2">
                            <Badge className={`text-xs ${getStatusColor(chat.status)}`}>
                              {chat.status}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(chat.priority)}`}>
                              {chat.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:w-2/3">
          {selectedChatId ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedChat?.subject}</span>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(selectedChat?.status || 'open')}>
                      {selectedChat?.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedChat?.priority || 'normal')}>
                      {selectedChat?.priority}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 mb-4">
                  {chatLoading ? (
                    <div className="text-center py-4">Loading messages...</div>
                  ) : selectedChat?.messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4 pr-4">
                      {selectedChat?.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.isAdminReply ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          {message.isAdminReply && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                S
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.isAdminReply
                                ? 'bg-muted'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.isAdminReply ? 'text-muted-foreground' : 'text-primary-foreground/70'
                            }`}>
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {!message.isAdminReply && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary">
                                U
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message Input */}
                <Form {...messageForm}>
                  <form onSubmit={messageForm.handleSubmit(onSendMessage)} className="flex gap-2">
                    <FormField
                      control={messageForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Type your message..."
                              {...field}
                              data-testid="input-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Select a ticket to view messages</h3>
                <p className="text-sm">Choose a support ticket from the list to start chatting</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}