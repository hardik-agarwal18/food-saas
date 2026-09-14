import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useUploadMenuMutation, useConfirmMenuImportMutation } from '@/features/restaurant/menu/mutations';
import { useMenuImportQuery } from '@/features/restaurant/menu/queries';
import { MenuImportStatus } from '@/types/api.types';

interface MenuImportModalProps {
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MenuImportModal({ restaurantId, isOpen, onClose }: MenuImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importId, setImportId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadMenuMutation(restaurantId);
  const confirmMutation = useConfirmMenuImportMutation(restaurantId);
  
  const { data: menuImport } = useMenuImportQuery(restaurantId, importId || "");

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setImportId(null);
      uploadMutation.reset();
      confirmMutation.reset();
    }
  }, [isOpen, uploadMutation, confirmMutation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile, {
      onSuccess: (data) => {
        setImportId(data.id);
      },
    });
  };

  const handleConfirm = () => {
    if (!importId) return;
    confirmMutation.mutate(
      { importId },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  const currentStatus = menuImport?.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Import Menu via AI</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={uploadMutation.isPending || confirmMutation.isPending}>
            <span className="text-xl leading-none">&times;</span>
          </Button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* STATE 1: UPLOAD */}
          {!importId && (
            <div className="space-y-6">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                Upload a PDF or Image of your menu. Our AI will automatically extract categories, items, descriptions, and prices.
              </div>
              
              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                />
                <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                {selectedFile ? (
                  <p className="font-medium text-primary">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="font-medium mb-1">Click to select a file</p>
                    <p className="text-sm text-slate-500">PDF, PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>

              {uploadMutation.isError && (
                <div className="text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Failed to upload file. Please try again.
                </div>
              )}
            </div>
          )}

          {/* STATE 2: PROCESSING */}
          {importId && (currentStatus === MenuImportStatus.UPLOADED || currentStatus === MenuImportStatus.PROCESSING) && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h3 className="text-lg font-semibold">Our AI is reading your menu...</h3>
              <p className="text-slate-500 max-w-sm">
                This usually takes about 10-30 seconds depending on the size and complexity of your menu.
              </p>
            </div>
          )}

          {/* STATE 3: READY FOR REVIEW */}
          {importId && currentStatus === MenuImportStatus.READY_FOR_REVIEW && menuImport?.extractedData && (
            <div className="space-y-6">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Menu parsed successfully!</p>
                  <p className="opacity-90">Please review the extracted items below. You can make edits to these items later in the dashboard.</p>
                </div>
              </div>

              <div className="space-y-6">
                {menuImport.extractedData.categories?.map((cat: any, i: number) => (
                  <div key={i} className="space-y-3">
                    <h4 className="font-bold text-lg border-b pb-1">{cat.name}</h4>
                    {cat.description && <p className="text-sm text-slate-500 italic">{cat.description}</p>}
                    
                    <div className="grid sm:grid-cols-2 gap-3">
                      {cat.items?.map((item: any, j: number) => (
                        <Card key={j} className="shadow-sm">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-sm pr-2">{item.name}</div>
                              <div className="font-semibold text-sm whitespace-nowrap">
                                ${Number(item.price).toFixed(2)}
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STATE 4: FAILED */}
          {importId && currentStatus === MenuImportStatus.FAILED && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 text-destructive">
              <AlertCircle className="w-12 h-12" />
              <h3 className="text-lg font-semibold">Failed to process menu</h3>
              <p className="text-sm max-w-sm">
                {menuImport?.failureReason || 'Our AI encountered an error while trying to read your menu. Please ensure the image/PDF is clear and try again.'}
              </p>
              <Button variant="outline" onClick={() => setImportId(null)}>Try Another File</Button>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={uploadMutation.isPending || confirmMutation.isPending}>
            Cancel
          </Button>
          
          {!importId && (
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {uploadMutation.isPending ? 'Uploading...' : 'Upload & Process'}
            </Button>
          )}

          {importId && currentStatus === MenuImportStatus.READY_FOR_REVIEW && (
            <Button 
              onClick={handleConfirm}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {confirmMutation.isPending ? 'Importing...' : 'Confirm Import'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
