import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Upload, X, CheckCircle } from 'lucide-react';

interface PaymentProofUploadProps {
	orderId?: string; // необязательно
	orderNumber?: string;
	onClose: () => void;
	onUploadComplete: (proofUrl: string) => void;
}

export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
	orderId,
	orderNumber,
	onClose,
	onUploadComplete
}) => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>('');
	const [uploading, setUploading] = useState(false);
	const [uploaded, setUploaded] = useState(false);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setPreviewUrl(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUpload = async () => {
		if (!selectedFile) return;

		setUploading(true);
		try {
			// Конвертация в base64 и возврат наверх без запроса к серверу
			const reader = new FileReader();
			const base64Promise: Promise<string> = new Promise((resolve, reject) => {
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = reject;
			});
			reader.readAsDataURL(selectedFile);
			const base64Image = await base64Promise;

			console.log('Чек сконвертирован в base64, длина:', base64Image.length, { orderId, orderNumber });
			setUploaded(true);
			onUploadComplete(base64Image);

			setTimeout(() => {
				onClose();
			}, 1000);
		} catch (error) {
			console.error('Ошибка обработки файла чека:', error);
			alert('Не удалось обработать файл. Попробуйте ещё раз.');
		} finally {
			setUploading(false);
		}
	};

	const removeFile = () => {
		setSelectedFile(null);
		setPreviewUrl('');
	};

	if (uploaded) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
					<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
					<h3 className="text-xl font-bold text-gray-900 mb-2">Фото загружено!</h3>
					<p className="text-gray-600">Спасибо! Изображение прикреплено к заказу.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg p-6 max-w-md w-full">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-bold text-gray-900">Загрузите фото чека</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600">
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="space-y-4">
					<p className="text-sm text-gray-600">
						Вы можете загрузить чек сейчас — он прикрепится к заказу при оформлении.
					</p>

					{/* Загрузка файла */}
					<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
						<input
							type="file"
							accept="image/*"
							onChange={handleFileSelect}
							className="hidden"
							id="file-upload"
						/>
						<label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
							<Upload className="w-8 h-8 text-gray-400 mb-2" />
							<span className="text-sm text-gray-600">{selectedFile ? 'Файл выбран' : 'Нажмите для выбора файла'}</span>
							<span className="text-xs text-gray-500 mt-1">JPG, PNG, GIF до 5MB</span>
						</label>
					</div>

					{/* Preview файла */}
					{previewUrl && (
						<div className="relative">
							<img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
							<button onClick={removeFile} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
								<X className="w-4 h-4" />
							</button>
						</div>
					)}

					{/* Кнопки */}
					<div className="flex space-x-3">
						<Button onClick={onClose} variant="outline" className="flex-1">Отмена</Button>
						<Button onClick={handleUpload} disabled={!selectedFile || uploading} className="flex-1 bg-red-600 hover:bg-red-700">
							{uploading ? 'Обработка...' : 'Прикрепить'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
