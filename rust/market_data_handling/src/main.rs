use std::env;
use std::process;
use zmq::{Context, SUB, PUB};
use serde_json::Value;

mod exchanges {
    #[cfg(feature = "binance")]
    pub mod binance;
}

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 4 {
        eprintln!("Please provide exchange, market as arguments.");
        process::exit(1);
    }

    let exchange = &args[2];
    let market = &args[3];

    let context = Context::new();
    let subscriber_sock = context.socket(SUB).unwrap();
    let publisher_sock = context.socket(PUB).unwrap();

    subscriber_sock.connect("tcp://127.0.0.1:5555").unwrap();
    subscriber_sock.set_subscribe(format!("{}.{}", exchange, market).as_bytes()).unwrap();

    publisher_sock.bind("tcp://127.0.0.1:5556").unwrap();

    async fn send_message(publisher_sock: &zmq::Socket, message: &str) {
        if let Err(error) = publisher_sock.send(message, 0) {
            eprintln!("Error sending message: {}", error);
        }
    }

    let handle_response = match exchange.as_str() {
        "binance" => exchanges::binance::handle_response,
        _ => {
            eprintln!("Unsupported exchange: {}", exchange);
            process::exit(1);
        }
    };

    loop {
        let message = subscriber_sock.recv_string(0).unwrap().unwrap();
        let response: Value = serde_json::from_str(&message).unwrap();
        let parsed_data = handle_response(response);
        println!("{:?}", parsed_data);

        let message_to_send = format!("{}.{}.parsed {}", exchange, market, parsed_data.to_string());
        send_message(&publisher_sock, &message_to_send).await;
    }
}
