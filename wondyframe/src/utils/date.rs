use std::cmp::Ordering;

use chrono::{DateTime, Duration, Utc};

pub fn format_timestamp() -> String {
    let now_utc: DateTime<Utc> = Utc::now();

    // In this case, the timestamp being formatted is "now"
    let input_utc = now_utc;
    let duration = now_utc.signed_duration_since(input_utc);

    if duration < Duration::hours(24) && now_utc.date_naive() == input_utc.date_naive() {
        format!("Today at {}", input_utc.format("%H:%M UTC"))
    } else {
        input_utc.format("%b %-d, %Y").to_string()
    }
}

pub fn eta_from_utc(utc: &str) -> String {
    let now_utc: DateTime<Utc> = Utc::now();
    let input_utc = DateTime::parse_from_rfc3339(utc).unwrap();

    let duration = input_utc.signed_duration_since(now_utc);

    match duration.num_seconds().cmp(&0) {
        Ordering::Less => "expired".to_string(),
        _ => {
            let total_seconds = duration.num_seconds();
            let days = total_seconds / 86400;
            let hours = (total_seconds % 86400) / 3600;
            let minutes = (total_seconds % 3600) / 60;
            let seconds = total_seconds % 60;

            format!(
                "{d}d {h}h {m}m {s}s",
                d = days,
                h = hours,
                m = minutes,
                s = seconds
            )
        }
    }
}
