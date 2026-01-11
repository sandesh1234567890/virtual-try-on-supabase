'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Loader2, Plus } from 'lucide-react';

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget); // Initialize formData first!

        const hiddenInput = document.getElementById('image-base64') as HTMLInputElement;
        const imageBase64 = hiddenInput?.value;

        const data = {
            name: formData.get('name'),
            category: formData.get('category'),
            image: imageBase64, // Use the base64 string
            stock: parseInt(formData.get('stock') as string),
        };

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                alert("Failed to add product");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus className="text-blue-600" />
                    Add New Product
                </h1>

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Product Name</label>
                        <input
                            name="name"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 bg-gray-50/50"
                            placeholder="e.g. Classic Trench Coat"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category</label>
                            <select
                                name="category"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-gray-50/50 appearance-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Casual">Casual</option>
                                <option value="T-Shirt">T-Shirt</option>
                                <option value="Jacket">Jacket</option>
                                <option value="Dress">Dress</option>
                                <option value="Shirt">Shirt</option>
                                <option value="Pants">Pants</option>
                                <option value="Suit">Suit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Stock Count</label>
                            <input
                                name="stock"
                                type="number"
                                defaultValue={100}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-gray-50/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Product Image</label>
                        <div className="relative">
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-blue-50/30 hover:bg-blue-50/50 hover:border-blue-300 transition-all group/drop">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover/drop:scale-110 transition-transform">
                                            <ImageIcon className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <p className="text-sm text-gray-600"><span className="font-bold text-blue-600">Click to upload</span> product image</p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">PNG, JPG or JPEG</p>
                                    </div>
                                    <input
                                        id="dropzone-file"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    const base64String = reader.result as string;
                                                    const hiddenInput = document.getElementById('image-base64') as HTMLInputElement;
                                                    if (hiddenInput) hiddenInput.value = base64String;
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <input type="hidden" name="image-data" id="image-base64" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-blue-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin text-white" size={20} /> : <Plus size={20} className="text-blue-100" />}
                            {loading ? 'Processing...' : 'Add to Collection'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
