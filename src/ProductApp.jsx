import React, { useState, useEffect } from 'react';

// Ganti URL ini dengan alamat file api.php Anda
const API_URL = 'http://localhost:8080/api.php';

function ProductApp() {
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '' });
    const [editingProduct, setEditingProduct] = useState(null); // Produk yang sedang di-edit
    const [error, setError] = useState(null);

    // --- READ: Mengambil semua produk ---
    const fetchProducts = () => {
        setError(null);
        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gagal mengambil data produk');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    setProducts(data.data);
                } else {
                    setError(data.message || 'Gagal mengambil data produk.');
                }
            })
            .catch(err => {
                setError('Error koneksi: ' + err.message);
                console.error('Fetch error:', err);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- CREATE: Menambahkan produk baru ---
    const handleAddProduct = (e) => {
        e.preventDefault();
        setError(null);

        const priceValue = parseFloat(newProduct.price);
        if (!newProduct.name || isNaN(priceValue) || priceValue <= 0) {
            setError("Nama produk dan harga yang valid harus diisi.");
            return;
        }

        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newProduct.name, price: priceValue }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Gagal menambah produk');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    setNewProduct({ name: '', price: '' }); // Kosongkan form
                    fetchProducts(); // Refresh daftar
                } else {
                    setError(data.message || 'Gagal menambah produk.');
                }
            })
            .catch(err => {
                setError('Error koneksi: ' + err.message);
                console.error('Post error:', err);
            });
    };

    // --- UPDATE: Memperbarui produk ---
    const handleUpdateProduct = (e) => {
        e.preventDefault();
        setError(null);
        if (!editingProduct) return;

        const priceValue = parseFloat(editingProduct.price);
        if (!editingProduct.name || isNaN(priceValue) || priceValue <= 0) {
            setError("Nama produk dan harga yang valid harus diisi.");
            return;
        }

        fetch(`${API_URL}?id=${editingProduct.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            // Menggunakan method: 'PUT' dengan body JSON
            body: JSON.stringify({ name: editingProduct.name, price: priceValue }),
        })
            .then(response => {
                if (response.status === 404) {
                    throw new Error('Produk tidak ditemukan atau tidak ada perubahan data.');
                }
                if (!response.ok) {
                    throw new Error('Gagal memperbarui produk');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    setEditingProduct(null); // Selesai edit
                    fetchProducts(); // Refresh daftar
                } else {
                    setError(data.message || 'Gagal memperbarui produk.');
                }
            })
            .catch(err => {
                setError('Error koneksi atau data: ' + err.message);
                console.error('Put error:', err);
            });
    };

    // --- DELETE: Menghapus produk ---
    const handleDeleteProduct = (id) => {
        setError(null);
        if (window.confirm('Yakin ingin menghapus produk ini?')) {
            fetch(`${API_URL}?id=${id}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (response.status === 404) {
                        throw new Error('Produk tidak ditemukan.');
                    }
                    if (!response.ok) {
                        throw new Error('Gagal menghapus produk');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        alert(data.message);
                        fetchProducts(); // Refresh daftar
                    } else {
                        setError(data.message || 'Gagal menghapus produk.');
                    }
                })
                .catch(err => {
                    setError('Error koneksi atau data: ' + err.message);
                    console.error('Delete error:', err);
                });
        }
    };

    // --- Render (Tampilan) ---
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Manajemen Produk &#128722;</h1>

            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>Error: {error}</p>}

            {/* Form Tambah/Edit */}
            <h2>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                <input
                    type="text"
                    placeholder="Nama Produk"
                    value={editingProduct ? editingProduct.name : newProduct.name}
                    onChange={(e) =>
                        editingProduct
                            ? setEditingProduct({ ...editingProduct, name: e.target.value })
                            : setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    required
                />
                <input
                    type="number"
                    placeholder="Harga"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={(e) =>
                        editingProduct
                            ? setEditingProduct({ ...editingProduct, price: e.target.value })
                            : setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    step="0.01"
                    required
                />
                <button type="submit">
                    {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
                {editingProduct && (
                    <button type="button" onClick={() => setEditingProduct(null)}>
                        Batal Edit
                    </button>
                )}
            </form>

            <hr style={{ margin: '20px 0' }} />

            {/* Daftar Produk */}
            <h2>Daftar Produk</h2>
            {products.length === 0 ? (
                <p>Tidak ada produk ditemukan.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama</th>
                            <th>Harga</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{parseFloat(product.price).toFixed(2)}</td>
                                <td>
                                    <button onClick={() => setEditingProduct({ ...product })}>Edit</button>
                                    <button onClick={() => handleDeleteProduct(product.id)} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ProductApp;