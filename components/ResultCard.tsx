import React, { useState } from 'react';
import { Download, Bot, CheckCircle, FileText, Loader2, RefreshCw } from 'lucide-react';
import { summarizeDocument } from '../services/geminiService';
import { saveAs } from 'file-saver';

interface ResultCardProps {
  fileName: string;
  blob: Blob;
  previewText: string;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ fileName, blob, previewText, onReset }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleDownload = () => {
    saveAs(blob, `unicode_${fileName}`);
  };

  const handleSummarize = async () => {
    if (!previewText) return;
    setIsSummarizing(true);
    try {
      const result = await summarizeDocument(previewText);
      setSummary(result);
    } catch (e) {
      setSummary("Không thể tóm tắt. Vui lòng kiểm tra API Key hoặc thử lại sau.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      <div className="p-6 bg-green-50 border-b border-green-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <h3 className="text-lg font-bold text-green-900">Chuyển đổi thành công!</h3>
            <p className="text-sm text-green-700">{fileName}</p>
          </div>
        </div>
        <button 
            onClick={onReset}
            className="text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-green-100 rounded-full"
            title="Làm mới"
        >
            <RefreshCw size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm focus:ring-4 focus:ring-blue-200"
          >
            <Download size={20} />
            <span>Tải về file Word</span>
          </button>
          
          <button
            onClick={handleSummarize}
            disabled={isSummarizing || !!summary || !previewText}
            className={`
              flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-lg font-medium transition-colors border focus:ring-4 focus:ring-purple-100
              ${summary 
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default' 
                : !previewText
                    ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'}
            `}
          >
            {isSummarizing ? <Loader2 className="animate-spin" size={20} /> : <Bot size={20} />}
            <span>{summary ? 'Đã phân tích xong' : 'Tóm tắt bằng AI'}</span>
          </button>
        </div>

        {/* AI Summary Section */}
        {(summary || isSummarizing) && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100 shadow-sm">
             <div className="flex items-center space-x-2 mb-3 text-purple-800">
                <Bot size={18} />
                <h4 className="font-semibold text-sm uppercase tracking-wider">Tóm tắt nội dung</h4>
             </div>
             {isSummarizing ? (
               <div className="space-y-2 animate-pulse">
                 <div className="h-4 bg-purple-200/50 rounded w-3/4"></div>
                 <div className="h-4 bg-purple-200/50 rounded w-full"></div>
                 <div className="h-4 bg-purple-200/50 rounded w-5/6"></div>
               </div>
             ) : (
               <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                 {summary}
               </p>
             )}
          </div>
        )}
        
        {/* Simple Text Preview */}
        <div className="mt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Xem trước nội dung (Đã chuyển đổi)</h4>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 h-40 overflow-y-auto text-sm text-slate-600 font-serif leading-relaxed">
                {previewText && previewText.length > 0 ? (
                    <span className="whitespace-pre-wrap">{previewText.slice(0, 2000)}{previewText.length > 2000 && "..."}</span>
                ) : (
                    <span className="text-slate-400 italic flex flex-col items-center justify-center h-full text-center">
                        <FileText size={24} className="mb-2 opacity-50" />
                        <span>Không tìm thấy nội dung văn bản thuần túy.<br/>File có thể chỉ chứa hình ảnh, bảng biểu hoặc text box phức tạp.</span>
                    </span>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};