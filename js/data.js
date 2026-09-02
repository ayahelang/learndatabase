/* Data materi database gratisan - Silverhawk LearnDatabase */
const DATABASES = [
  {
    id: "firebase",
    name: "Firebase (Firestore + Auth)",
    category: ["nosql", "baas"],
    icon: "🔥",
    short: "Platform BaaS Google. Firestore NoSQL real-time, Authentication, Hosting, dan Cloud Functions.",
    color: "#FFA000",
    intro: "Firebase adalah Backend-as-a-Service (BaaS) dari Google. Cocok untuk aplikasi web & mobile. Firestore adalah database NoSQL dokumen real-time. Free tier (Spark Plan) cukup generus untuk proyek kecil-menengah.",
    registrasi: [
      "Buka https://console.firebase.google.com dan login dengan akun Google.",
      "Klik 'Add project' → beri nama project → ikuti wizard (bisa skip Google Analytics).",
      "Setelah project dibuat, klik 'Build' → 'Firestore Database' → Create database.",
      "Pilih mode production atau test (untuk belajar, test mode OK, nanti ubah rules).",
      "Pilih lokasi region terdekat (asia-southeast1 / Singapore).",
      "Ke Project Settings → Your apps → Add web app → salin firebaseConfig."
    ],
    implementasi: [
      "Install: npm install firebase  atau CDN di HTML.",
      "Inisialisasi dengan firebaseConfig (apiKey, authDomain, projectId, dll).",
      "Import { initializeApp } from 'firebase/app' dan { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore'.",
      "Gunakan collection() + addDoc() untuk create, getDocs() untuk read.",
      "Atur Security Rules di console agar tidak terbuka untuk semua orang."
    ],
    deploy: [
      "Karena pure frontend + Firebase SDK, cukup push ke GitHub Pages.",
      "Pastikan hanya public config yang di-commit (jangan service account).",
      "Aktifkan Authentication jika perlu login user.",
      "Monitor usage di Firebase Console → Usage and billing."
    ],
    tips: "Gunakan Firebase Emulator Suite untuk development lokal. Jangan biarkan rules 'allow read, write: if true' di production.",
    snippet: `// Firebase Firestore contoh
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create
await addDoc(collection(db, "items"), { name: "Laptop", price: 5000000 });

// Read
const snap = await getDocs(collection(db, "items"));
snap.forEach(doc => console.log(doc.id, doc.data()));`
  },
  {
    id: "supabase",
    name: "Supabase",
    category: ["sql", "baas"],
    icon: "⚡",
    short: "Alternatif open-source Firebase. Postgres + Auth + Realtime + Storage. Free tier sangat kuat.",
    color: "#3ECF8E",
    intro: "Supabase adalah open-source Firebase alternative berbasis PostgreSQL. Menyediakan database SQL, Authentication, Realtime subscriptions, Storage, dan Edge Functions. Free tier: 500MB database, 1GB file storage, 50.000 monthly active users.",
    registrasi: [
      "Buka https://supabase.com → Start your project → Sign up (GitHub / email).",
      "Klik 'New project' → pilih organization → isi nama, database password, region.",
      "Tunggu project selesai provisioning (1-2 menit).",
      "Ke Settings → API → salin Project URL dan anon public key.",
      "Ke Table Editor → buat tabel pertama (atau gunakan SQL Editor)."
    ],
    implementasi: [
      "Install: npm install @supabase/supabase-js",
      "Buat client: createClient(SUPABASE_URL, SUPABASE_ANON_KEY)",
      "Gunakan .from('table').select() / .insert() / .update() / .delete()",
      "Aktifkan Row Level Security (RLS) dan buat policy agar aman.",
      "Realtime: channel.subscribe() untuk listen perubahan data."
    ],
    deploy: [
      "Frontend static + Supabase JS SDK → sempurna untuk GitHub Pages.",
      "Simpan URL & anon key di environment atau config (aman karena anon + RLS).",
      "Jangan expose service_role key di frontend.",
      "Gunakan Supabase Auth untuk login user jika diperlukan."
    ],
    tips: "Selalu enable RLS. Buat policy yang sesuai (misal: auth.uid() = user_id). Free tier reset usage setiap bulan.",
    snippet: `// Supabase contoh
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_ANON_KEY'
)

// Create
const { data, error } = await supabase
  .from('items')
  .insert([{ name: 'Laptop', price: 5000000 }])

// Read
const { data: items } = await supabase
  .from('items')
  .select('*')
  .order('created_at', { ascending: false })`
  },
  {
    id: "mongodb-atlas",
    name: "MongoDB Atlas",
    category: ["nosql"],
    icon: "🍃",
    short: "Cloud database MongoDB. Free M0 cluster 512MB. Cocok untuk dokumen JSON fleksibel.",
    color: "#00ED64",
    intro: "MongoDB Atlas adalah managed MongoDB di cloud. Cluster gratis (M0) memberi 512MB storage, shared RAM. Data berbentuk dokumen BSON/JSON, sangat fleksibel untuk skema yang berubah-ubah.",
    registrasi: [
      "Buka https://www.mongodb.com/cloud/atlas → Sign Up.",
      "Buat Organization & Project.",
      "Build a Database → pilih FREE (M0) → pilih region → Create.",
      "Buat database user (username + password).",
      "Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0) untuk development.",
      "Database → Connect → Drivers → salin connection string."
    ],
    implementasi: [
      "Untuk browser murni: gunakan MongoDB Realm / App Services (Data API atau GraphQL).",
      "Atau buat thin backend (Cloudflare Workers / Vercel serverless) yang connect ke Atlas.",
      "Node.js: mongodb driver atau mongoose.",
      "Data API: HTTP endpoint yang bisa dipanggil dari frontend dengan API key."
    ],
    deploy: [
      "GitHub Pages tidak bisa connect langsung ke MongoDB driver (butuh Node).",
      "Solusi: aktifkan Atlas Data API atau App Services, lalu panggil via fetch dari frontend.",
      "Atau host API kecil di Cloudflare Workers / Deno Deploy (gratis)."
    ],
    tips: "Jangan expose connection string yang berisi password di frontend. Gunakan Data API + API Key terbatas.",
    snippet: `// MongoDB Atlas Data API (dari browser)
const res = await fetch(
  'https://data.mongodb-api.com/app/YOUR_APP/endpoint/data/v1/action/find',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': 'YOUR_DATA_API_KEY'
    },
    body: JSON.stringify({
      dataSource: 'Cluster0',
      database: 'mydb',
      collection: 'items',
      filter: {}
    })
  }
)
const data = await res.json()`
  },
  {
    id: "neon",
    name: "Neon (Serverless Postgres)",
    category: ["sql"],
    icon: "🟢",
    short: "Postgres serverless dengan branching. Free tier 0.5GB storage, scale-to-zero.",
    color: "#00E699",
    intro: "Neon adalah PostgreSQL serverless. Fitur unggulan: database branching (seperti git), scale-to-zero, dan connection pooling. Free tier cocok untuk side project dan pembelajaran.",
    registrasi: [
      "Buka https://neon.tech → Sign Up (GitHub/Google/email).",
      "Create a project → pilih nama & region.",
      "Salin connection string (postgres://...) dari dashboard.",
      "Gunakan SQL Editor di console untuk membuat tabel."
    ],
    implementasi: [
      "Dari frontend murni: butuh API layer (karena Postgres tidak langsung dari browser).",
      "Opsi: Neon serverless driver + Cloudflare Workers / Vercel Edge.",
      "Atau gunakan Neon dengan framework full-stack (Next.js API routes).",
      "Library: @neondatabase/serverless atau pg."
    ],
    deploy: [
      "Untuk GitHub Pages: buat proxy API di Cloudflare Workers yang query Neon, lalu frontend fetch ke worker.",
      "Atau migrasi ke framework yang support server components."
    ],
    tips: "Manfaatkan branching untuk development & preview. Connection pooling penting di serverless.",
    snippet: `// Neon + serverless driver (di edge/worker)
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const rows = await sql\`SELECT * FROM items ORDER BY id DESC LIMIT 10\`
console.log(rows)`
  },
  {
    id: "planetscale",
    name: "PlanetScale",
    category: ["sql"],
    icon: "🪐",
    short: "MySQL serverless dengan branching & non-blocking schema changes. Free tier tersedia.",
    color: "#F01E29",
    intro: "PlanetScale adalah MySQL-compatible serverless database. Dibangun di atas Vitess (teknologi YouTube). Mendukung database branching dan schema deploy tanpa downtime.",
    registrasi: [
      "Buka https://planetscale.com → Sign up.",
      "Create database → pilih region & nama.",
      "Dari dashboard, dapatkan connection string atau gunakan PlanetScale CLI.",
      "Aktifkan 'Safe Migrations' jika diinginkan."
    ],
    implementasi: [
      "Gunakan @planetscale/database driver (HTTP-based, cocok serverless).",
      "Atau Prisma / Drizzle ORM yang support PlanetScale.",
      "Tidak butuh connection pooling khusus karena protokol HTTP."
    ],
    deploy: [
      "Sama seperti Neon: frontend GitHub Pages + API proxy (Cloudflare Workers / Vercel).",
      "Connection string simpan di environment variable backend."
    ],
    tips: "Branching sangat powerful untuk review schema change. Free tier punya limit rows & storage.",
    snippet: `// PlanetScale driver
import { connect } from '@planetscale/database'

const conn = connect({ url: process.env.DATABASE_URL })

const results = await conn.execute('SELECT * FROM items LIMIT 10')
console.log(results.rows)`
  },
  {
    id: "turso",
    name: "Turso (libSQL / SQLite edge)",
    category: ["sql"],
    icon: "🗄️",
    short: "SQLite di edge. Sangat cepat, free tier generous, cocok untuk edge computing.",
    color: "#4FF8D2",
    intro: "Turso adalah database edge berbasis libSQL (fork SQLite). Data bisa di-replicate ke lokasi terdekat user. Free tier: 9GB storage, 500 databases, 1 miliar row reads/bulan.",
    registrasi: [
      "Buka https://turso.tech → Sign up.",
      "Install Turso CLI atau gunakan dashboard web.",
      "turso db create namadb → turso db show namadb → salin URL.",
      "Buat auth token: turso db tokens create namadb"
    ],
    implementasi: [
      "Library: @libsql/client",
      "Bisa dipanggil dari browser (dengan token) atau dari edge worker.",
      "API mirip SQLite biasa: execute(), batch()."
    ],
    deploy: [
      "Bisa langsung dari frontend (hati-hati dengan token) atau via worker.",
      "Sangat cocok digabung dengan Cloudflare Pages / Workers."
    ],
    tips: "Ideal untuk aplikasi yang butuh latency rendah di banyak region. Jaga token tetap aman.",
    snippet: `// Turso / libSQL
import { createClient } from "@libsql/client"

const client = createClient({
  url: "libsql://YOUR_DB.turso.io",
  authToken: "YOUR_TOKEN"
})

const rs = await client.execute("SELECT * FROM items")
console.log(rs.rows)`
  },
  {
    id: "appwrite",
    name: "Appwrite",
    category: ["baas", "nosql"],
    icon: "🚀",
    short: "BaaS open-source self-host atau cloud. Databases, Auth, Storage, Functions.",
    color: "#F02E65",
    intro: "Appwrite adalah open-source Backend-as-a-Service. Bisa self-host atau pakai Appwrite Cloud. Menyediakan Databases (collections), Authentication, Storage, Functions, dan Realtime.",
    registrasi: [
      "Cloud: https://cloud.appwrite.io → Sign up → Create project.",
      "Atau self-host dengan Docker.",
      "Buat database & collection di console.",
      "Ambil Project ID dan endpoint, buat API key jika perlu."
    ],
    implementasi: [
      "SDK Web: appwrite",
      "new Client().setEndpoint().setProject()",
      "Databases API untuk CRUD documents."
    ],
    deploy: [
      "Frontend + Appwrite Web SDK → cocok GitHub Pages.",
      "Atur permissions di collection agar aman."
    ],
    tips: "Self-host memberi kontrol penuh. Cloud free tier ada limit.",
    snippet: `// Appwrite Web SDK
import { Client, Databases, ID } from "appwrite"

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("YOUR_PROJECT_ID")

const databases = new Databases(client)

await databases.createDocument(
  "DATABASE_ID", "COLLECTION_ID", ID.unique(),
  { name: "Laptop", price: 5000000 }
)`
  },
  {
    id: "pocketbase",
    name: "PocketBase",
    category: ["baas", "nosql"],
    icon: "📦",
    short: "Backend dalam satu file. SQLite + Auth + Realtime + Admin UI. Self-host gratis.",
    color: "#B8DBE4",
    intro: "PocketBase adalah open-source backend dalam single executable file. Menggunakan SQLite, dilengkapi realtime subscriptions, authentication, file storage, dan admin dashboard. 100% gratis jika self-host.",
    registrasi: [
      "Download binary dari https://pocketbase.io sesuai OS.",
      "Jalankan ./pocketbase serve → buka http://127.0.0.1:8090/_/",
      "Buat admin account pertama.",
      "Buat collection di Admin UI.",
      "Untuk production: deploy binary ke VPS / Railway / Fly.io / dll."
    ],
    implementasi: [
      "SDK JS: pocketbase",
      "const pb = new PocketBase('https://your-domain.com')",
      "pb.collection('items').getList() / create() / update() / delete()"
    ],
    deploy: [
      "Frontend di GitHub Pages, PocketBase di server murah/VPS.",
      "Atau full stack di satu VPS.",
      "Realtime out-of-the-box."
    ],
    tips: "Sangat ringan. Cocok untuk MVP dan internal tools. Backup file SQLite secara berkala.",
    snippet: `// PocketBase JS SDK
import PocketBase from 'pocketbase'

const pb = new PocketBase('https://YOUR_POCKETBASE_URL')

// Create
const record = await pb.collection('items').create({
  name: 'Laptop',
  price: 5000000
})

// Read
const records = await pb.collection('items').getFullList({
  sort: '-created'
})`
  }
];

const PLAYGROUND_SNIPPETS = {
  firebase: {
    title: "Firebase Firestore",
    code: `import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "project.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// CREATE
await addDoc(collection(db, "products"), {
  name: "Keyboard Mechanical",
  price: 750000,
  stock: 12
});

// READ
const snapshot = await getDocs(collection(db, "products"));
snapshot.forEach((d) => console.log(d.id, d.data()));

// UPDATE
await updateDoc(doc(db, "products", "DOC_ID"), { stock: 10 });

// DELETE
await deleteDoc(doc(db, "products", "DOC_ID"));`
  },
  supabase: {
    title: "Supabase JS Client",
    code: `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xxxx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // anon key
const supabase = createClient(supabaseUrl, supabaseKey)

// CREATE
const { data, error } = await supabase
  .from('products')
  .insert([{ name: 'Keyboard', price: 750000, stock: 12 }])
  .select()

// READ
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('stock', 12)
  .order('created_at', { ascending: false })

// UPDATE
await supabase
  .from('products')
  .update({ stock: 10 })
  .eq('id', 1)

// DELETE
await supabase
  .from('products')
  .delete()
  .eq('id', 1)`
  },
  mongodb: {
    title: "MongoDB Atlas Data API",
    code: `const DATA_API_URL = 'https://data.mongodb-api.com/app/data-xxxx/endpoint/data/v1'
const API_KEY = 'YOUR_DATA_API_KEY'

async function findProducts() {
  const res = await fetch(\`\${DATA_API_URL}/action/find\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY
    },
    body: JSON.stringify({
      dataSource: 'Cluster0',
      database: 'shop',
      collection: 'products',
      filter: { stock: { $gt: 0 } },
      sort: { price: 1 },
      limit: 20
    })
  })
  return res.json()
}

async function insertProduct(doc) {
  const res = await fetch(\`\${DATA_API_URL}/action/insertOne\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY
    },
    body: JSON.stringify({
      dataSource: 'Cluster0',
      database: 'shop',
      collection: 'products',
      document: doc
    })
  })
  return res.json()
}`
  },
  neon: {
    title: "Neon Serverless (Edge)",
    code: `// Jalankan di Cloudflare Workers / Vercel Edge / Node
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// Query tagged template
const products = await sql\`
  SELECT id, name, price, stock
  FROM products
  WHERE stock > 0
  ORDER BY price ASC
  LIMIT 20
\`

// Insert
const [newRow] = await sql\`
  INSERT INTO products (name, price, stock)
  VALUES (\${'Keyboard'}, \${750000}, \${12})
  RETURNING *
\`

// Update
await sql\`
  UPDATE products SET stock = stock - 1
  WHERE id = \${productId}
\``
  }
};

// Default demo voucher (rahasia)
const DEMO_VOUCHER = "D3m0";
