import React from 'react';
import { Upload, X, CreditCard, Building, FileText } from 'lucide-react';

interface PaymentSectionProps {
  bookingId: string;
  totalAmount: number;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

export default function PaymentSection({ bookingId, totalAmount, onPaymentComplete, onCancel }: PaymentSectionProps) {
  const [receipt, setReceipt] = React.useState<string>('');
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const bankDetails = {
    bankName: "Commercial Bank of Ceylon",
    accountName: "RideHub (Pvt) Ltd",
    accountNumber: "8001234567890",
    branch: "Colombo Main Branch",
    swiftCode: "CCEYLKLX"
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ receipt: 'Please upload a valid image (JPG, PNG) or PDF file' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ receipt: 'File size must be less than 5MB' });
        return;
      }

      setReceiptFile(file);
      setErrors({});

      const reader = new FileReader();
      reader.onloadend = () => {
        setReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!receipt) {
      setErrors({ receipt: 'Please upload your payment receipt' });
      return;
    }

    // TODO: Submit receipt to backend
    console.log('Payment receipt submitted:', { bookingId, receiptFile });
    onPaymentComplete();
  };

  const advanceAmount = Math.round(totalAmount * 0.3); // 30% advance

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bank Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Building className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Bank Account Details</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Bank Name:</label>
                  <p className="text-gray-900 font-medium">{bankDetails.bankName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Name:</label>
                  <p className="text-gray-900 font-medium">{bankDetails.accountName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Account Number:</label>
                  <p className="text-gray-900 font-medium font-mono text-lg">{bankDetails.accountNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Branch:</label>
                  <p className="text-gray-900 font-medium">{bankDetails.branch}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">SWIFT Code:</label>
                  <p className="text-gray-900 font-medium">{bankDetails.swiftCode}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-blue-800">Payment Amount</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-blue-700">Total Booking Amount: <span className="font-bold">${totalAmount}</span></p>
                  <p className="text-lg font-bold text-blue-800">Advance Payment Required: ${advanceAmount}</p>
                  <p className="text-xs text-blue-600">Remaining ${totalAmount - advanceAmount} to be paid on completion</p>
                </div>
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex items-center mb-4">
                    <FileText className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Upload Payment Receipt</h3>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Instructions:</h4>
                    <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                      <li>Transfer the advance amount (${advanceAmount}) to the above bank account</li>
                      <li>Take a clear photo or scan of your payment receipt</li>
                      <li>Upload the receipt below (JPG, PNG, or PDF format)</li>
                      <li>Submit to complete your booking request</li>
                    </ol>
                  </div>

                  {receipt ? (
                    <div className="relative">
                      {receiptFile?.type === 'application/pdf' ? (
                        <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-green-50">
                          <FileText className="h-12 w-12 text-green-600 mx-auto mb-2" />
                          <p className="text-green-700 font-medium">{receiptFile.name}</p>
                          <p className="text-sm text-green-600">PDF uploaded successfully</p>
                        </div>
                      ) : (
                        <img
                          src={receipt}
                          alt="Payment Receipt"
                          className="w-full h-64 object-contain rounded-lg border"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setReceipt('');
                          setReceiptFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <span className="text-lg font-medium text-gray-700 mb-2">Upload Payment Receipt</span>
                      <span className="text-sm text-gray-500">JPG, PNG, or PDF (max 5MB)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        className="hidden"
                        onChange={handleReceiptUpload}
                      />
                    </label>
                  )}
                  {errors.receipt && <p className="mt-2 text-sm text-red-600">{errors.receipt}</p>}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Booking Reference:</h4>
                  <p className="text-sm text-gray-600">Booking ID: <span className="font-mono font-bold">{bookingId}</span></p>
                  <p className="text-xs text-gray-500 mt-1">Please include this reference in your bank transfer</p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={!receipt}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Submit Payment Receipt
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}