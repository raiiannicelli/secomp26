import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  placeholder?: string;
  className?: string;
  showUrlInput?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label,
  description,
  aspectRatio = 'square',
  placeholder = 'Carregar Imagem Local',
  className = '',
  showUrlInput = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, envie um arquivo de imagem válido (JPG, PNG, WEBP, SVG, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem excede o tamanho máximo permitido de 10MB.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          onChange(data.url);
          setManualUrl(data.url);
          setSuccess('Imagem enviada e armazenada no servidor local!');
          setTimeout(() => setSuccess(null), 4000);
          return;
        }
      }

      // Se falhar o endpoint do backend (ex: modo mock/client isolado), usa FileReader para não quebrar a UI
      const reader = new FileReader();
      reader.onload = () => {
        const fallbackUrl = reader.result as string;
        onChange(fallbackUrl);
        setManualUrl(fallbackUrl);
        setSuccess('Imagem carregada localmente no navegador!');
        setTimeout(() => setSuccess(null), 4000);
      };
      reader.readAsDataURL(file);
    } catch {
      // Fallback gracioso com base64
      const reader = new FileReader();
      reader.onload = () => {
        const fallbackUrl = reader.result as string;
        onChange(fallbackUrl);
        setManualUrl(fallbackUrl);
        setSuccess('Imagem carregada localmente no navegador!');
        setTimeout(() => setSuccess(null), 4000);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setSuccess('URL aplicada com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleClear = () => {
    onChange('');
    setManualUrl('');
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9]'
      : 'min-h-[120px]';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono text-[#707a8a] uppercase tracking-wider block font-semibold">
            {label}
          </label>
          {showUrlInput && (
            <button
              type="button"
              onClick={() => setIsUrlMode(!isUrlMode)}
              className="text-[10px] font-mono text-[#fcd535] hover:text-[#f0b90b] underline flex items-center gap-1 transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              <span>{isUrlMode ? 'Upload de Arquivo' : 'Inserir URL direta'}</span>
            </button>
          )}
        </div>
      )}

      {/* Modo de Entrada por URL direta */}
      {isUrlMode ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://... ou /uploads/..."
              className="w-full px-3 py-2 pl-8 rounded-lg bg-[#0b0e11] border border-[#2b3139] text-white text-xs placeholder-[#707a8a] focus:outline-none focus:border-[#fcd535] transition-colors"
            />
            <LinkIcon className="w-3.5 h-3.5 text-[#707a8a] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="button"
            onClick={handleManualUrlSubmit}
            className="px-3 py-2 rounded-lg bg-[#1e2329] hover:bg-[#2b3139] border border-[#2b3139] hover:border-[#fcd535] text-white text-xs font-mono font-bold transition-colors"
          >
            Aplicar
          </button>
        </div>
      ) : (
        /* Modo Upload de Arquivo Drag & Drop */
        <div>
          {value ? (
            <div className="relative group rounded-xl overflow-hidden border border-[#2b3139] bg-[#0b0e11] flex items-center justify-center p-2">
              <div className={`relative w-full ${aspectClass} max-h-48 overflow-hidden rounded-lg flex items-center justify-center bg-[#181a20]/60`}>
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Ações sobre a imagem */}
              <div className="absolute inset-0 bg-[#0b0e11]/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-lg bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-mono font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Trocar Foto</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg bg-[#f6465d]/20 hover:bg-[#f6465d]/30 text-[#f6465d] border border-[#f6465d]/40 transition-colors"
                  title="Remover Imagem"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#fcd535] bg-[#fcd535]/10 scale-[0.99]'
                  : 'border-[#2b3139] hover:border-[#fcd535]/60 hover:bg-[#181a20]/80 bg-[#0b0e11]'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <div className="p-3 rounded-full bg-[#181a20] border border-[#2b3139] text-[#fcd535]">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#fcd535]" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-[#fcd535]" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono font-semibold text-white">
                    {isUploading ? 'Armazenando no servidor...' : placeholder}
                  </p>
                  <p className="text-[10px] text-[#707a8a]">
                    Arraste ou clique para selecionar (JPG, PNG, WEBP, SVG • máx. 10MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />
        </div>
      )}

      {description && !error && !success && (
        <p className="text-[10px] text-[#707a8a]">{description}</p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#f6465d]/10 border border-[#f6465d]/40 text-[#f6465d] text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0ecb81]/10 border border-[#0ecb81]/40 text-[#0ecb81] text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};
