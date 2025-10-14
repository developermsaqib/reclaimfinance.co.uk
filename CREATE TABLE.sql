CREATE TABLE
  form_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    postcode VARCHAR(255) DEFAULT '',
    address TEXT DEFAULT '',
    iva_bankruptcy_status VARCHAR(100) DEFAULT '',
    title VARCHAR(50) DEFAULT '',
    firstname VARCHAR(100) DEFAULT '',
    lastname VARCHAR(100) DEFAULT '',
    previousname VARCHAR(100) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    authority_accepted TINYINT (1) DEFAULT 0,
    signature_long TEXT DEFAULT NULL, -- base64 dataURL
    completed TINYINT (1) DEFAULT 0,
    expires_at DATETIME DEFAULT NULL,
    agent_ip VARCHAR(45) DEFAULT NULL,
    agent_useragent TEXT DEFAULT NULL,
    agent_os VARCHAR(100) DEFAULT NULL,
    user_ip VARCHAR(45) DEFAULT NULL,
    user_useragent TEXT DEFAULT NULL,
    user_os VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE INDEX idx_token ON form_submissions (token);