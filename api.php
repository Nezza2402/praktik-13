<?php
// api.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Untuk menerima PUT dan DELETE request dari fetch
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simpan data di file JSON (sebagai database sederhana)
$dataFile = 'products.json';

// Inisialisasi file jika belum ada
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode(['data' => []]));
}

$data = json_decode(file_get_contents($dataFile), true);

// Fungsi untuk menyimpan data
function saveData($data) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
}

// GET: Ambil semua produk
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'data' => $data['data']
    ]);
    exit();
}

// POST: Tambah produk baru
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['name']) || !isset($input['price'])) {
        echo json_encode(['success' => false, 'message' => 'Data tidak valid']);
        exit();
    }
    
    $newProduct = [
        'id' => uniqid(),
        'name' => htmlspecialchars($input['name']),
        'price' => floatval($input['price'])
    ];
    
    $data['data'][] = $newProduct;
    saveData($data);
    
    echo json_encode([
        'success' => true,
        'message' => 'Produk berhasil ditambahkan',
        'data' => $newProduct
    ]);
    exit();
}

// PUT: Update produk
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = $_GET['id'] ?? '';
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$id || !$input) {
        echo json_encode(['success' => false, 'message' => 'ID atau data tidak valid']);
        exit();
    }
    
    $found = false;
    foreach ($data['data'] as &$product) {
        if ($product['id'] === $id) {
            $product['name'] = htmlspecialchars($input['name']);
            $product['price'] = floatval($input['price']);
            $found = true;
            break;
        }
    }
    
    if ($found) {
        saveData($data);
        echo json_encode(['success' => true, 'message' => 'Produk berhasil diperbarui']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Produk tidak ditemukan']);
    }
    exit();
}

// DELETE: Hapus produk
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? '';
    
    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID tidak valid']);
        exit();
    }
    
    $initialCount = count($data['data']);
    $data['data'] = array_filter($data['data'], function($product) use ($id) {
        return $product['id'] !== $id;
    });
    
    if (count($data['data']) < $initialCount) {
        saveData($data);
        echo json_encode(['success' => true, 'message' => 'Produk berhasil dihapus']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Produk tidak ditemukan']);
    }
    exit();
}

// Jika method tidak dikenali
echo json_encode(['success' => false, 'message' => 'Method tidak didukung']);
?>