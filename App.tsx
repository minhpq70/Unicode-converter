import React, { useState } from 'react';
import { Type, Sparkles, AlertCircle } from 'lucide-react';
import { Dropzone } from './components/Dropzone';
import { ResultCard } from './components/ResultCard';
import { processDocxFile } from './utils/docxHandler';
import { AppState, ConversionResult } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileSelected = async (file: File) => {
    setAppState(AppState.PROCESSING);
    setErrorMsg('');
    
    try {
      // Small delay to let UI show processing state
      await new Promise(r => setTimeout(r, 500));
      
      const { blob, textContent } = await processDocxFile(file);
      
      setResult({
        fileName: file.name,
        originalSize: file.size,
        blob: blob,
        previewText: textContent
      });
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Đã xảy ra lỗi không xác định trong quá trình xử lý.");
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <Type size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              UniDoc Converter
            </h1>
          </div>
          <div className="flex items-center space-x-1 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            <Sparkles size={14} className="text-purple-500" />
            <span>AI Enhanced</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            Chuyển đổi Font ABC sang Unicode
          </h2>
          <p className="text-slate-600">
            Tự động phát hiện và chuyển đổi văn bản TCVN3 cũ (như .VnTime) sang Unicode chuẩn. Giữ nguyên định dạng bảng, ảnh và kiểu chữ.
          </p>
        </div>

        {/* State Machine UI */}
        <div className="transition-all duration-300">
          {appState === AppState.IDLE && (
            <Dropzone onFileSelected={handleFileSelected} />
          )}

          {appState === AppState.PROCESSING && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="relative w-16 h-16 mx-auto mb-4">
                 <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-slate-800">Đang xử lý tài liệu...</h3>
              <p className="text-slate-500 text-sm mt-2">Đang phân tích XML và chuyển mã ký tự</p>
            </div>
          )}

          {appState === AppState.SUCCESS && result && (
            <ResultCard 
              fileName={result.fileName}
              blob={result.blob}
              previewText={result.previewText}
              onReset={reset}
            />
          )}

          {appState === AppState.ERROR && (
             <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="inline-flex bg-red-100 text-red-500 p-3 rounded-full mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-red-800 mb-2">Lỗi xử lý</h3>
                <p className="text-red-600 mb-6">{errorMsg}</p>
                <button 
                  onClick={reset}
                  className="px-6 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Thử lại
                </button>
             </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} UniDoc Tool. Xử lý cục bộ tại trình duyệt.</p>
      </footer>
    </div>
  );
}

export default App;
