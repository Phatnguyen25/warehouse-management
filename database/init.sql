-- ============================================================
-- Warehouse Management System — PostgreSQL Schema
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy search

-- ============================================================
-- Users & Auth
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff', 'viewer');

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    name        VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- bcrypt hashed
    role        user_role DEFAULT 'staff',
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Categories
-- ============================================================
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Suppliers
-- ============================================================
CREATE TABLE suppliers (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         VARCHAR(255) UNIQUE NOT NULL,
    email        VARCHAR(255),
    phone        VARCHAR(50),
    address      TEXT,
    contact_name VARCHAR(255),
    is_active    BOOLEAN DEFAULT true,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Products
-- ============================================================
CREATE TABLE products (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku          VARCHAR(100) UNIQUE NOT NULL,
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    unit         VARCHAR(50) DEFAULT 'piece',  -- piece, kg, liter, box...
    price        DECIMAL(15, 2) DEFAULT 0,
    cost         DECIMAL(15, 2) DEFAULT 0,
    category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id  UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    min_stock    INTEGER DEFAULT 0,   -- minimum stock alert threshold
    is_active    BOOLEAN DEFAULT true,
    image_url    VARCHAR(500),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for search
CREATE INDEX idx_products_name ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);

-- ============================================================
-- Warehouses
-- ============================================================
CREATE TABLE warehouses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) UNIQUE NOT NULL,
    address     TEXT,
    manager_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouse locations (shelves, racks, zones)
CREATE TABLE warehouse_locations (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code         VARCHAR(100) NOT NULL,  -- e.g. A-01-03 (zone-row-shelf)
    description  VARCHAR(255),
    UNIQUE(warehouse_id, code)
);

-- ============================================================
-- Inventory (Stock)
-- ============================================================
CREATE TABLE inventory (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    location_id  UUID REFERENCES warehouse_locations(id) ON DELETE SET NULL,
    quantity     INTEGER NOT NULL DEFAULT 0,
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id, location_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);

-- ============================================================
-- Stock Transactions (Nhập/Xuất kho)
-- ============================================================
CREATE TYPE transaction_type AS ENUM (
    'import',       -- nhập kho
    'export',       -- xuất kho
    'transfer',     -- chuyển kho
    'adjustment',   -- kiểm kê điều chỉnh
    'return'        -- hàng trả về
);

CREATE TABLE stock_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id),
    from_warehouse  UUID REFERENCES warehouses(id),
    to_warehouse    UUID REFERENCES warehouses(id),
    from_location   UUID REFERENCES warehouse_locations(id),
    to_location     UUID REFERENCES warehouse_locations(id),
    transaction_type transaction_type NOT NULL,
    quantity        INTEGER NOT NULL,
    unit_cost       DECIMAL(15, 2),
    reference_no    VARCHAR(100),   -- order number, etc.
    note            TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_product ON stock_transactions(product_id);
CREATE INDEX idx_transactions_created ON stock_transactions(created_at DESC);

-- ============================================================
-- Purchase Orders
-- ============================================================
CREATE TYPE order_status AS ENUM (
    'draft', 'pending', 'ordered', 'partial', 'received', 'cancelled'
);

CREATE TABLE purchase_orders (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no     VARCHAR(100) UNIQUE NOT NULL,
    supplier_id  UUID NOT NULL REFERENCES suppliers(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    status       order_status DEFAULT 'draft',
    total_amount DECIMAL(15, 2) DEFAULT 0,
    note         TEXT,
    order_date   TIMESTAMPTZ,
    expected_at  TIMESTAMPTZ,
    received_at  TIMESTAMPTZ,
    created_by   UUID REFERENCES users(id),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id         UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id       UUID NOT NULL REFERENCES products(id),
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_cost        DECIMAL(15, 2) NOT NULL,
    total_cost       DECIMAL(15, 2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED
);

-- ============================================================
-- Activity Logs (Audit + Graphiti source)
-- ============================================================
CREATE TABLE activity_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,   -- e.g. 'product.create', 'stock.import'
    entity_type VARCHAR(100),            -- 'product', 'order', 'inventory'
    entity_id   UUID,
    description TEXT,                    -- Human-readable description for Graphiti
    metadata    JSONB,                   -- Extra data
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Seed: Default admin user (password: Admin@123456)
-- Change password immediately after first login!
-- ============================================================
INSERT INTO users (email, name, password, role) VALUES
(
    'admin@warehouse.local',
    'System Admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RgDCaW9TS',  -- bcrypt hash
    'admin'
);
