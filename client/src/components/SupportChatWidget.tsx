import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MessageCircle, Send, Plus, HelpCircle, Minimize2, Maximize2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types
interface SupportChat {
  id: string;
  userId: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  lastMessageAt: string;
  createdAt: string;
}

interface SupportMessage {
  id: string;
  chatId: string;
  userId: string | null;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
}

interface ChatWithMessages extends SupportChat {
  messages: SupportMessage[];
}

// Language utilities
const getLanguage = () => localStorage.getItem('language') || 'en';

const translations = {
  en: {
    title: "Support Chat",
    newTicket: "New Ticket",
    subject: "Subject",
    message: "Message",
    send: "Send",
    create: "Create",
    cancel: "Cancel",
    chats: "Support Tickets",
    noChats: "No support tickets found",
    typeMessage: "Type your message...",
    open: "Open",
    closed: "Closed", 
    pending: "Pending",
    createNewTicket: "Create New Support Ticket",
    enterSubject: "Enter ticket subject",
    enterMessage: "Enter your message",
    lastUpdated: "Last updated"
  },
  th: {
    title: "แชทสนับสนุน",
    newTicket: "ตั๋วใหม่",
    subject: "หัวข้อ",
    message: "ข้อความ",
    send: "ส่ง",
    create: "สร้าง",
    cancel: "ยกเลิก",
    chats: "ตั๋วสนับสนุน", 
    noChats: "ไม่พบตั๋วสนับสนุน",
    typeMessage: "พิมพ์ข้อความของคุณ...",
    open: "เปิด",
    closed: "ปิด",
    pending: "รอดำเนินการ",
    createNewTicket: "สร้างตั๋วสนับสนุนใหม่",
    enterSubject: "กรอกหัวข้อตั๋ว",
    enterMessage: "กรอกข้อความของคุณ",
    lastUpdated: "อัพเดตล่าสุด"
  }
};

const getStatusText = (status: string) => {
  const language = getLanguage();
  const t = translations[language as keyof typeof translations];
  return status === 'open' ? t.open : status === 'closed' ? t.closed : t.pending;
};

const getStatusColor = (status: string) => {
  return status === 'open' ? 'bg-green-500' : status === 'closed' ? 'bg-red-500' : 'bg-yellow-500';
};

// Schemas
const createChatSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Message is required"),
});

const sendMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

type CreateChatForm = z.infer<typeof createChatSchema>;
type SendMessageForm = z.infer<typeof sendMessageSchema>;

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const language = getLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const t = translations[language as keyof typeof translations];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatId]);

  // Queries
  const { data: chats = [], isLoading: chatsLoading } = useQuery<SupportChat[]>({
    queryKey: ['/api/support/chats'],
    enabled: isOpen,
  });

  const { data: selectedChat, isLoading: chatLoading } = useQuery<ChatWithMessages>({
    queryKey: ['/api/support/chats', selectedChatId],
    enabled: !!selectedChatId && isOpen,
  });

  // Mutations
  const createChatMutation = useMutation({
    mutationFn: async (data: CreateChatForm) => {
      const response = await apiRequest('POST', '/api/support/chats', data);
      return await response.json();
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats'] });
      setSelectedChatId(newChat.id);
      setIsCreateDialogOpen(false);
      toast({ title: "Support ticket created successfully" });
    },
    onError: (error: Error) => {
      console.error('Create ticket error:', error);
      toast({ title: "Error creating support ticket", description: error.message, variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageForm) => {
      const response = await apiRequest('POST', `/api/support/chats/${selectedChatId}/messages`, data);
      return await response.json();
    },
    onSuccess: () => {
      messageForm.reset(); // Clear the form after successful send
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support/chats'] });
    },
    onError: (error: Error) => {
      console.error('Send message error:', error);
      toast({ title: "Error sending message", description: error.message, variant: "destructive" });
    },
  });

  // Forms
  const createForm = useForm<CreateChatForm>({
    resolver: zodResolver(createChatSchema),
    defaultValues: { subject: "", content: "" },
  });

  const messageForm = useForm<SendMessageForm>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: { message: "" },
  });

  // Handlers
  const handleCreateChat = (data: CreateChatForm) => {
    createChatMutation.mutate(data);
  };

  const handleSendMessage = (data: SendMessageForm) => {
    if (selectedChatId) {
      sendMessageMutation.mutate(data);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            size="sm"
            className="rounded-full w-16 h-16 shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border-0 hover:scale-105 transition-all duration-200"
            data-testid="support-chat-button"
          >
            <HelpCircle size={24} />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-80 bg-background border shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[480px]'}`}
          data-testid="support-chat-window"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="font-medium text-sm">{t.title}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 h-7 w-7 rounded-full"
                data-testid="minimize-chat-button"
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedChatId(null);
                  setIsMinimized(false);
                }}
                className="text-white hover:bg-white/20 p-1 h-7 w-7 rounded-full"
                data-testid="close-chat-button"
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex flex-col h-[420px] transition-all duration-200">
              {selectedChatId ? (
                <div className="flex-1 flex flex-col">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {chatLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
                    ) : selectedChat?.messages?.length ? (
                      <div className="space-y-4">
                        {selectedChat.messages.map((message: any) => (
                          <div key={message.id} className={`flex ${message.isAdminReply ? 'justify-start' : 'justify-end'}`}>
                            <div
                              className={`p-3 rounded-lg text-sm max-w-[80%] ${
                                message.isAdminReply
                                  ? 'bg-muted border border-border text-foreground'
                                  : 'bg-primary text-primary-foreground shadow-sm'
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">{message.message}</div>
                              <div className={`text-xs mt-1 ${
                                message.isAdminReply ? 'text-muted-foreground' : 'text-primary-foreground/70'
                              }`}>
                                {message.isAdminReply ? 'Support' : 'You'} • {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No messages yet</div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-3">
                    <Form {...messageForm}>
                      <form onSubmit={messageForm.handleSubmit(handleSendMessage)} className="flex gap-2">
                        <FormField
                          control={messageForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder={t.typeMessage}
                                  {...field}
                                  data-testid="message-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="px-3"
                          disabled={sendMessageMutation.isPending}
                          data-testid="send-message-button"
                        >
                          <Send size={14} />
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col p-4">
                  {/* Header with New Ticket Button */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-sm">{t.chats}</h3>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="h-8 px-3 text-xs"
                      data-testid="new-ticket-button"
                    >
                      <Plus size={12} className="mr-1" />
                      {t.newTicket}
                    </Button>
                  </div>

                  {/* Chat List */}
                  <ScrollArea className="flex-1">
                    {chatsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : chats.length > 0 ? (
                      <div className="space-y-2">
                        {chats.map((chat) => (
                          <div
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 hover:scale-[1.02] transition-all duration-200"
                            data-testid={`chat-item-${chat.id}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm truncate">{chat.subject}</h4>
                              <Badge className={getStatusColor(chat.status)} variant="secondary">
                                {getStatusText(chat.status)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {t.lastUpdated}: {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">{t.noChats}</div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createNewTicket}</DialogTitle>
            <DialogDescription>
              Create a new support ticket to get help from our team.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateChat)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.subject}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.enterSubject} {...field} data-testid="create-subject-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.message}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t.enterMessage} {...field} rows={4} data-testid="create-message-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit" disabled={createChatMutation.isPending} data-testid="create-ticket-submit">
                  {t.create}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}