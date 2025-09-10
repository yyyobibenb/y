import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, Send, Clock, AlertCircle, CheckCircle, User, RefreshCw } from "lucide-react";
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
  unreadMessages: number;
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
const replyMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

const updateChatSchema = z.object({
  status: z.enum(["open", "in_progress", "closed"]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

type ReplyMessageForm = z.infer<typeof replyMessageSchema>;
type UpdateChatForm = z.infer<typeof updateChatSchema>;

export default function SupportChatAdmin() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // WebSocket for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Admin connected to support chat WebSocket');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_support_message') {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['/api/support/chats'] });
          if (data.chatId === selectedChatId) {
            queryClient.invalidateQueries({ queryKey: ['/api/support/chats', data.chatId] });
          }
          
          // Show notification for new user messages
          if (!data.isAdminReply) {
            toast({
              title: "New support message",
              description: `${data.senderName}: ${data.message.substring(0, 50)}...`,
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = () => {
      console.error('Admin WebSocket connection error');
    };

    return () => {
      socket.close();
    };
  }, [selectedChatId, queryClient, toast]);

  // Queries
  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useQuery<SupportChat[]>({
    queryKey: ['/api/support/chats'],
  });

  const { data: selectedChat, isLoading: chatLoading } = useQuery<ChatWithMessages>({
    queryKey: ['/api/support/chats', selectedChatId],
    enabled: !!selectedChatId,
  });

  // Mutations
  const replyMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string; message: string }) => {
      return apiRequest("POST", `/api/support/chats/${chatId}/messages`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats'] });
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send reply",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateChatMutation = useMutation({
    mutationFn: async ({ chatId, updates }: { chatId: string; updates: Partial<UpdateChatForm> }) => {
      return apiRequest("PATCH", `/api/support/chats/${chatId}/status`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats'] });
      toast({
        title: "Chat updated",
        description: "Chat status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update chat",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Forms
  const replyForm = useForm<ReplyMessageForm>({
    resolver: zodResolver(replyMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSendReply = (data: ReplyMessageForm) => {
    if (selectedChatId) {
      replyMutation.mutate({
        chatId: selectedChatId,
        message: data.message,
      });
      replyForm.reset();
    }
  };

  const onUpdateChatStatus = (status: string) => {
    if (selectedChatId) {
      updateChatMutation.mutate({
        chatId: selectedChatId,
        updates: { status: status as "open" | "in_progress" | "closed" },
      });
    }
  };

  const onUpdateChatPriority = (priority: string) => {
    if (selectedChatId) {
      updateChatMutation.mutate({
        chatId: selectedChatId,
        updates: { priority: priority as "low" | "normal" | "high" | "urgent" },
      });
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

  const totalUnreadMessages = chats.reduce((total, chat) => total + (chat.unreadMessages || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Tickets</p>
                <p className="text-2xl font-bold">{chats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Unread Messages</p>
                <p className="text-2xl font-bold text-red-500">{totalUnreadMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Open Tickets</p>
                <p className="text-2xl font-bold">{chats.filter(c => c.status === 'open').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Closed Today</p>
                <p className="text-2xl font-bold">{chats.filter(c => c.status === 'closed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6">
        {/* Chat List */}
        <div className="w-1/3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Support Tickets
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchChats()}
                data-testid="button-refresh-chats"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {chatsLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : chats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No support tickets</p>
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
                        data-testid={`admin-chat-item-${chat.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate flex items-center gap-2">
                              {chat.subject}
                              {chat.unreadMessages > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {chat.unreadMessages}
                                </Badge>
                              )}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {chat.user.email}
                            </p>
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
        <div className="w-2/3">
          {selectedChatId ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedChat?.subject}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedChat?.user.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedChat?.status}
                      onValueChange={onUpdateChatStatus}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedChat?.priority}
                      onValueChange={onUpdateChatPriority}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                            message.isAdminReply ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!message.isAdminReply && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.isAdminReply
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.isAdminReply ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          {message.isAdminReply && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                A
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {/* Reply Input */}
                <Form {...replyForm}>
                  <form onSubmit={replyForm.handleSubmit(onSendReply)} className="space-y-2">
                    <FormField
                      control={replyForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Type your reply..."
                              className="min-h-[80px]"
                              {...field}
                              data-testid="textarea-admin-reply"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={replyMutation.isPending}
                        data-testid="button-send-admin-reply"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {replyMutation.isPending ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Select a ticket to view messages</h3>
                <p className="text-sm">Choose a support ticket from the list to manage</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}