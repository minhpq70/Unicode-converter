import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { convertTcvn3ToUnicode, replaceFontNames } from './converter';
import { FONT_REPLACEMENT_MAP } from '../constants';

export const processDocxFile = async (file: File): Promise<{ blob: Blob, textContent: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (!content) {
          reject(new Error("File content is empty"));
          return;
        }

        const zip = new PizZip(content as ArrayBuffer);
        const parser = new DOMParser();
        const serializer = new XMLSerializer();
        
        let mainDocumentText = "";
        let otherText = "";
        let processedFilesCount = 0;

        // Iterate over all files in the zip manually to be robust
        Object.keys(zip.files).forEach((fileName) => {
            // Check if it is a content XML (matches word/document.xml, header1.xml, footer2.xml, etc.)
            // We use a broader check to ensure we catch all text containers
            if (!fileName.match(/^word\/(document|header|footer|footnotes|endnotes)\d*\.xml$/)) {
                return;
            }

            const f = zip.file(fileName);
            if (!f) return;
            
            const xmlContent = f.asText();
            if (!xmlContent) return;

            processedFilesCount++;

            const doc = parser.parseFromString(xmlContent, "text/xml");
            const textNodes = doc.getElementsByTagName("w:t");
            
            let fileTextContent = "";

            for (let i = 0; i < textNodes.length; i++) {
                const node = textNodes[i];
                // Use textContent for robust reading/writing.
                const originalText = node.textContent || "";
                
                // Skip empty nodes
                if (!originalText || originalText.trim().length === 0) continue;

                // Convert text
                const convertedText = convertTcvn3ToUnicode(originalText);
                
                // Update the node content in the DOM
                node.textContent = convertedText;
                
                // Accumulate text for preview
                fileTextContent += convertedText + " ";
            }

            // Serialize back to string
            let newXmlStr = serializer.serializeToString(doc);

            // Replace Font Definitions in this specific XML (for inline font overrides)
            newXmlStr = replaceFontNames(newXmlStr, FONT_REPLACEMENT_MAP);
            
            // Update the file in the zip
            zip.file(fileName, newXmlStr);

            // Store text for preview
            // Prioritize document.xml content, but keep others just in case
            if (fileName.includes("word/document.xml")) {
                mainDocumentText += fileTextContent;
            } else {
                otherText += fileTextContent;
            }
        });

        if (processedFilesCount === 0) {
            reject(new Error("Không tìm thấy cấu trúc văn bản Word hợp lệ (word/document.xml)."));
            return;
        }

        // 2. Process Global Styles & Themes (Fonts definition)
        const globalXmlFiles = [
            "word/styles.xml",
            "word/fontTable.xml",
            "word/theme/theme1.xml"
        ];

        globalXmlFiles.forEach(fileName => {
            if (zip.files[fileName]) {
                const xmlStr = zip.file(fileName)?.asText();
                if (xmlStr) {
                    const newXmlStr = replaceFontNames(xmlStr, FONT_REPLACEMENT_MAP);
                    zip.file(fileName, newXmlStr);
                }
            }
        });

        // Determine final preview text (fallback to other text if main doc is empty/image-only)
        const finalPreviewText = mainDocumentText.trim().length > 0 
            ? mainDocumentText 
            : otherText;

        // Generate output
        const out = zip.generate({
          type: "blob",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        resolve({ blob: out, textContent: finalPreviewText.trim() });

      } catch (err) {
        console.error(err);
        reject(new Error("Lỗi khi xử lý cấu trúc file Word. Đảm bảo file không bị hỏng."));
      }
    };

    reader.onerror = () => reject(new Error("Không thể đọc file."));
    reader.readAsArrayBuffer(file);
  });
};