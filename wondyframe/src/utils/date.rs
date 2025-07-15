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
