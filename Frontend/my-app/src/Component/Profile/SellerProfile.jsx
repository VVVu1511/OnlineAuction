import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ProductCard from '../ProductCard/ProductCard';
import AddAuctionProduct from './AddProduct';

export default function SellerProfileUI({ user, token }) {
    const [myProducts, setMyProducts] = useState([]);
    const [wonProducts, setWonProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // modal state
    const [showAppendModal, setShowAppendModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [appendHtml, setAppendHtml] = useState('');

    const [showRateModal, setShowRateModal] = useState(false);
    const [rateTarget, setRateTarget] = useState(null);
    const [rateValue, setRateValue] = useState(1);
    const [rateComment, setRateComment] = useState('');

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };

    // ---------- Fetch data ----------
    useEffect(() => {
        async function loadData() {
        setLoading(true);
        try {
            const [myRes, wonRes] = await Promise.all([
            fetch('http://localhost:3000/product/myActiveProducts', { headers }),
            fetch('http://localhost:3000/product/myWonProducts', { headers }),
            ]);

            const myJson = await myRes.json();
            const wonJson = await wonRes.json();

            setMyProducts(myJson.data || []);
            setWonProducts(wonJson.data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Lấy dữ liệu thất bại');
        } finally {
            setLoading(false);
        }
        }

        loadData();
    }, [token]);

    // ---------- Handlers ----------
    const openAppendModal = (product) => { setCurrentProduct(product); setAppendHtml(''); setShowAppendModal(true); };
    const openRateModal = (product, winner) => { setRateTarget({ product, winner }); setRateValue(1); setRateComment(''); setShowRateModal(true); };
    const openCancelModal = (product, winner) => { setCancelTarget({ product, winner }); setShowCancelModal(true); };

    // ---------- Render helpers ----------
    function formatDate(d) {
        try {
        return new Date(d).toLocaleString();
        } catch {
        return d;
        }
    }

    function chunkArray(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }


    return (
        <div className="p-5">
        
        {loading && <div>Đang tải dữ liệu...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        <AddAuctionProduct />

        {/* Active products */}
        <section className="mb-8">
            <h3 className="text-xl font-medium mb-2">Sản phẩm đang đăng & còn hạn</h3>
            {myProducts.length === 0 && !loading && <div>Không có sản phẩm nào.</div>}

            {chunkArray(myProducts, 5).map((row, rowIndex) => (
                <div className="row g-5 mb-2" key={rowIndex}>
                    {row.map((p, index) => (
                        <div className="col-2" key={index}>
                            <ProductCard data={p} />
                        </div>
                    ))}
                </div>
            ))}
        </section>

        {/* Won products */}
        <section className="mb-8">
            <h3 className="text-xl font-medium mb-2">Sản phẩm đã có người thắng</h3>
            {wonProducts.length === 0 && !loading && <div>Chưa có sản phẩm nào được đấu xong.</div>}

            {chunkArray(wonProducts, 5).map((row, rowIndex) => (
                <div className="row g-5 mb-2" key={rowIndex}>
                    {row.map((p, index) => (
                        <div className="col-2" key={index}>
                            <ProductCard data={p} />
                        </div>
                    ))}
                </div>
            ))}
        </section>


      {/* Modals (Append / Rate / Cancel) */}
      {/* Append modal */}
        {showAppendModal && currentProduct && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-3xl p-6 rounded shadow-lg">
                <h4 className="text-lg font-semibold mb-2">Bổ sung mô tả: {currentProduct.name}</h4>
                <ReactQuill value={appendHtml} onChange={setAppendHtml} />
                <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowAppendModal(false)} className="px-4 py-2 border rounded">Huỷ</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Ghi thêm</button>
                </div>
            </div>
            </div>
        )}

        {/* Rate modal */}
        {showRateModal && rateTarget && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
                <h4 className="text-lg font-semibold mb-2">Đánh giá người thắng: {rateTarget.winner.name}</h4>
                <div className="mb-2">
                <label className="block mb-1">Điểm (+1 / -1)</label>
                <select value={rateValue} onChange={e => setRateValue(Number(e.target.value))} className="border p-2 rounded w-full">
                    <option value={1}>+1</option>
                    <option value={-1}>-1</option>
                </select>
                </div>
                <div className="mb-4">
                <label className="block mb-1">Nhận xét</label>
                <textarea value={rateComment} onChange={e => setRateComment(e.target.value)} className="w-full border rounded p-2" rows={4}/>
                </div>
                <div className="flex justify-end gap-2">
                <button onClick={() => setShowRateModal(false)} className="px-3 py-1 border rounded">Huỷ</button>
                <button className="px-3 py-1 bg-green-600 text-white rounded">Gửi đánh giá</button>
                </div>
            </div>
            </div>
        )}

        {/* Cancel modal */}
        {showCancelModal && cancelTarget && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-md p-6 rounded shadow-lg">
                <h4 className="text-lg font-semibold mb-2">Huỷ giao dịch: {cancelTarget.product.name}</h4>
                <div className="mb-4">
                <label>Lý do</label>
                <textarea value={'Người thắng không thanh toán'} disabled className="w-full border rounded p-2" rows={3}/>
                </div>
                <div className="flex justify-end gap-2">
                <button onClick={() => setShowCancelModal(false)} className="px-3 py-1 border rounded">Huỷ</button>
                <button className="px-3 py-1 bg-red-500 text-white rounded">Xác nhận huỷ</button>
                </div>
            </div>
            </div>
        )}

    </div>

    )
}

