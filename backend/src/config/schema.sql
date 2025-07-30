-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255),
    address TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('CREATED', 'PREPARING', 'DISPATCHED', 'DELIVERED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_events table
CREATE TABLE IF NOT EXISTS order_events (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('CREATED', 'PREPARING', 'DISPATCHED', 'DELIVERED')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, event_type)
);

-- Create alert_rules table
CREATE TABLE IF NOT EXISTS alert_rules (
    id SERIAL PRIMARY KEY,
    rule_type TEXT NOT NULL,
    threshold INTEGER NOT NULL,
    active BOOLEAN DEFAULT true
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    message TEXT NOT NULL,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_timestamp ON order_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_order_id ON alerts(order_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alert_rules_active ON alert_rules(active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for orders table
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default alert rules
INSERT INTO alert_rules (rule_type, threshold, active) VALUES 
('NOT_DISPATCHED_IN_X_DAYS', 2, true),
('NOT_DELIVERED_SAME_DAY', 24, true)
ON CONFLICT DO NOTHING;

-- Insert sample orders for testing
INSERT INTO orders (customer_name, address, status) VALUES 
('John Doe', '123 Main St, City, State 12345', 'CREATED'),
('Jane Smith', '456 Oak Ave, Town, State 67890', 'PREPARING'),
('Bob Johnson', '789 Pine Rd, Village, State 11111', 'DISPATCHED')
ON CONFLICT DO NOTHING;

-- Insert sample order events for the sample orders
INSERT INTO order_events (order_id, event_type) 
SELECT id, status FROM orders
ON CONFLICT DO NOTHING; 