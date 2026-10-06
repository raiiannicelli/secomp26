import { useEffect, useRef, useCallback, useTransition } from 'react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  Sparkles,
  Command,
  SendIcon,
  XIcon,
  LoaderIcon,
  Paperclip,
  Award,
  DollarSign,
  Rocket,
  Lock,
  LogIn,
  CheckCircle2,
  Building,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { useUIStore, isUserAuthenticated } from '../../stores/useUIStore';

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
  icon?: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className={cn('relative', containerClassName)}>
        <textarea
          className={cn(
            'flex min-h-[60px] w-full rounded-md border border-transparent bg-transparent px-3 py-2 text-sm text-white',
            'transition-all duration-200 ease-in-out',
            'placeholder:text-[#707a8a]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            showRing
              ? 'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              : '',
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showRing && isFocused && (
          <motion.span
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-[#fcd535]/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export function AnimatedAIChat() {
  const user = useUIStore((state) => state.user);
  const authenticated = isUserAuthenticated(user);

  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [, startTransition] = useTransition();
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [, setRecentCommand] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sentSuccess, setSentSuccess] = useState(false);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef<HTMLDivElement>(null);

  const commandSuggestions: CommandSuggestion[] = [
    {
      label: 'Cotas de Patrocínio',
      description: 'Consultar cotas Diamante, Ouro e Prata',
      prefix: '/patrocinio',
    },
    {
      label: 'Ideathon Express',
      description: 'Submeter projeto ou tirar dúvidas da maratona',
      prefix: '/ideathon',
    },
    {
      label: 'Certificados & Horas',
      description: 'Como validar 30h complementares no passaporte',
      prefix: '/certificados',
    },
  ];

  useEffect(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      setShowCommandPalette(true);

      const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) =>
        cmd.prefix.startsWith(value)
      );

      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector('[data-command-button]');

      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          setValue(selectedCommand.prefix + ' ');
          setShowCommandPalette(false);

          setRecentCommand(selectedCommand.label);
          setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    // REGRA DE OURO: Obrigatoriamente redireciona para login se não estiver autenticado
    if (!authenticated) {
      window.location.href =
        '/auth?next=' +
        encodeURIComponent(window.location.pathname + '#contato');
      return;
    }

    if (value.trim()) {
      startTransition(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setValue('');
          adjustHeight(true);
          setSentSuccess(true);
          setTimeout(() => setSentSuccess(false), 5000);
        }, 2200);
      });
    }
  };

  const handleAttachFile = () => {
    if (!authenticated) {
      window.location.href =
        '/auth?next=' +
        encodeURIComponent(window.location.pathname + '#contato');
      return;
    }
    const mockFileName = `proposta-secomp-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((prev) => [...prev, mockFileName]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + ' ');
    setShowCommandPalette(false);

    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  return (
    <div className="w-full flex flex-col justify-center bg-transparent text-white relative select-none">
      <div className="w-full relative z-10">
        <motion.div
          className="relative space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Header Central de Atendimento */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white pb-1 uppercase">
                Tire suas duvidas <span className="text-[#fcd535]"></span>
              </h2>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono text-[#fcd535] mb-2">
                <span> dacom@utfpr.edu.br</span>
              </div>
              <motion.div
                className="h-px from-transparent via-[#fcd535]/30 to-transparent"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.div>
            <motion.p
              className="text-xs sm:text-sm text-[#929aa5] font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Digite sua dúvida, proposta ou use comandos rápidos como <code className="text-[#fcd535]">/patrocinio</code>
            </motion.p>
          </div>


          {/* Card Principal do Animated AI Chat */}
          <motion.div
            className="relative backdrop-blur-2xl bg-[#14161a]/90 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Command Palette Dropdown */}
            <AnimatePresence>
              {showCommandPalette && (
                <motion.div
                  ref={commandPaletteRef}
                  className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-[#0b0e11]/95 rounded-xl z-50 shadow-2xl overflow-hidden"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="py-1 bg-[#0b0e11]">
                    {commandSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.prefix}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-xs transition-colors cursor-pointer',
                          activeSuggestion === index
                            ? 'bg-[#181a20] text-white'
                            : 'text-[#929aa5] hover:bg-[#181a20]/60 hover:text-white'
                        )}
                        onClick={() => selectCommandSuggestion(index)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        {suggestion.icon && (
                          <div className="w-5 h-5 flex items-center justify-center">
                            {suggestion.icon}
                          </div>
                        )}
                        <div className="font-bold text-white">{suggestion.label}</div>
                        <div className="text-[#707a8a] text-[11px] ml-1 font-mono">
                          {suggestion.prefix}
                        </div>
                        <div className="text-[10px] text-[#707a8a] ml-auto hidden sm:block font-sans">
                          {suggestion.description}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Textarea */}
            <div className="p-4 sm:p-5">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={
                  authenticated
                    ? 'Digite sua dúvida, cota de patrocínio ou use / para comandos...'
                    : 'Faça login para enviar mensagens para a coordenação...'
                }
                containerClassName="w-full"
                className={cn(
                  'w-full px-2 py-2',
                  'resize-none',
                  'bg-transparent',
                  'border-none',
                  'text-white text-sm sm:text-base',
                  'focus:outline-none',
                  'placeholder:text-[#707a8a]',
                  'min-h-[60px]'
                )}
                style={{
                  overflow: 'hidden',
                }}
                showRing={false}
              />
            </div>

            {/* Anexos */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  className="px-4 pb-3 flex gap-2 flex-wrap"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2 text-xs bg-[#181a20] border border-[#2b3139] py-1.5 px-3 rounded-lg text-[#eaecef]"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <span className="font-mono">{file}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-[#707a8a] hover:text-white transition-colors"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar Inferior */}
            <div className="p-4 border-t border-[#2b3139] bg-[#181a20]/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  onClick={handleAttachFile}
                  whileTap={{ scale: 0.94 }}
                  title="Anexar Proposta / Arquivo"
                  className="p-2.5 text-[#707a8a] hover:text-white hover:bg-[#2b3139]/60 rounded-xl transition-colors relative group"
                >
                  <Paperclip className="w-4 h-4" />
                </motion.button>
                <motion.button
                  type="button"
                  data-command-button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCommandPalette((prev) => !prev);
                  }}
                  whileTap={{ scale: 0.94 }}
                  title="Comandos Rápidos"
                  className={cn(
                    'p-2.5 text-[#707a8a] hover:text-white hover:bg-[#2b3139]/60 rounded-xl transition-colors relative group',
                    showCommandPalette && 'text-[#181a20]'
                  )}
                >
                  <Command className="w-4 h-4" />
                </motion.button>
              </div>

              <motion.button
                type="button"
                onClick={handleSendMessage}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isTyping}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-lg',
                  !authenticated
                    ? 'bg-[#fcd535] text-[#181a20] hover:bg-[#f0b90b]'
                    : value.trim()
                      ? 'bg-[#fcd535] text-[#181a20] shadow-[#fcd535]/10'
                      : 'bg-[#2b3139] text-[#707a8a] hover:text-white'
                )}
              >
                {isTyping ? (
                  <LoaderIcon className="w-4 h-4 animate-spin text-[#181a20]" />
                ) : !authenticated ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
                <span>
                  {!authenticated
                    ? 'ENTRAR'
                    : isTyping
                      ? 'ENVIANDO...'
                      : 'ENVIAR MENSAGEM'}
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* Feedback de Envio */}
          <AnimatePresence>
            {sentSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-[#0ecb81]/15 border border-[#0ecb81] text-[#0ecb81] text-xs font-mono flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>MENSAGEM REGISTRADA! A COORDENAÇÃO RESPONDERÁ EM ATÉ 24H ÚTEIS.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badges de Atalhos de Comando */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {commandSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.prefix}
                onClick={() => selectCommandSuggestion(index)}
                className="flex items-center gap-2 px-3.5 py-2 bg-[#14161a] hover:bg-[#181a20] rounded-xl text-xs text-[#929aa5] hover:text-white transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                {suggestion.icon}
                <span className="font-medium text-white">{suggestion.label}</span>
                <span className="text-[10px] font-mono text-[#707a8a]">
                  {suggestion.prefix}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Thinking State */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="fixed bottom-8 mx-auto transform backdrop-blur-2xl bg-[#14161a] rounded-full px-5 py-2.5 shadow-2xl border border-[#fcd535]/40 z-50 flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="w-7 h-7 rounded-full bg-[#fcd535] text-[#181a20] flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-white">
              <span>Despachando para coordenação DACOM</span>
              <TypingDots />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {inputFocused && (
        <motion.div
          className="fixed w-[40rem] h-[40rem] rounded-full pointer-events-none z-0 opacity-[0.03] bg-gradient-to-r from-[#fcd535] via-[#0ecb81] to-[#fcd535] blur-[120px]"
          animate={{
            x: mousePosition.x - 300,
            y: mousePosition.y - 300,
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 150,
            mass: 0.5,
          }}
        />
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-[#fcd535] rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default AnimatedAIChat;
