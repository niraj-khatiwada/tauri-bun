use std::time::{SystemTime, UNIX_EPOCH};

use jsonwebtoken::{
    decode, encode, Algorithm, DecodingKey, EncodingKey, Header, TokenData, Validation,
};
use rand::RngCore;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    sub: String,
    exp: usize,
}

pub fn generate_secret_hex() -> String {
    let mut key = [0u8; 32];
    rand::rng().fill_bytes(&mut key);
    key.iter().map(|b| format!("{:02x}", b)).collect()
}

pub fn generate_token(secret_hex: &str, subject: &str) -> String {
    let secret_bytes = hex::decode(secret_hex).expect("Invalid hex key");
    let key = EncodingKey::from_secret(&secret_bytes);

    let exp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + 24 * 3600;

    let claims = Claims {
        sub: subject.to_string(),
        exp: exp as usize,
    };

    encode(&Header::default(), &claims, &key).expect("JWT encoding failed")
}

pub fn verify_token(
    secret_hex: &str,
    token: &str,
) -> Result<TokenData<Claims>, jsonwebtoken::errors::Error> {
    let secret_bytes = hex::decode(secret_hex).expect("Invalid hex key");
    let key = DecodingKey::from_secret(&secret_bytes);

    decode::<Claims>(token, &key, &Validation::new(Algorithm::HS256))
}
