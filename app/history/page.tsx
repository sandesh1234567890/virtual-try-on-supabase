import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch history for the user
    const history = await prisma.tryOnStats.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            timestamp: 'desc'
        },
        include: {
            product: true
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold font-outfit text-gray-900">My Try-On History</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {history.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 mb-4">You haven't tried on anything yet.</p>
                        <Link href="/" className="text-blue-600 hover:underline">Start Trying On</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {history.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                                    {item.outputImage ? (
                                        <img src={item.outputImage} alt="Try On Result" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Processing...</div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="p-3 flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-md overflow-hidden border border-gray-100 shrink-0">
                                        <img src={item.product?.image || '/placeholder.png'} alt={item.product?.name || 'Custom'} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm truncate">{item.product?.name || 'Custom Usage'}</h3>
                                        <p className="text-[10px] text-gray-500 truncate">{item.product?.category || 'Personal Upload'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
