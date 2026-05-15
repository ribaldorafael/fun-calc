/// Math engine — formatting, scientific functions, constants, factorial.
/// Pure functions, no Tauri dependency.

pub fn format_number(n: f64) -> String {
    if n.is_nan() {
        return "NaN".into();
    }
    if n.is_infinite() {
        return if n.is_sign_positive() {
            "Infinity"
        } else {
            "-Infinity"
        }
        .into();
    }
    if n == n.floor() && n.abs() < 1e15 {
        format!("{}", n as i64)
    } else {
        let s = format!("{:.10}", n);
        let s = s.trim_end_matches('0');
        let s = s.trim_end_matches('.');
        s.to_string()
    }
}

pub fn factorial(n: u64) -> f64 {
    if n <= 1 {
        return 1.0;
    }
    let mut result: f64 = 1.0;
    for i in 2..=n {
        result *= i as f64;
    }
    result
}

pub fn scientific_fn(func: &str, value: f64) -> Result<f64, String> {
    match func {
        "sin" => Ok(value.to_radians().sin()),
        "cos" => Ok(value.to_radians().cos()),
        "tan" => Ok(value.to_radians().tan()),
        "asin" => {
            if !(-1.0..=1.0).contains(&value) {
                return Err("Domain error: asin requires -1 <= x <= 1".into());
            }
            Ok(value.asin().to_degrees())
        }
        "acos" => {
            if !(-1.0..=1.0).contains(&value) {
                return Err("Domain error: acos requires -1 <= x <= 1".into());
            }
            Ok(value.acos().to_degrees())
        }
        "atan" => Ok(value.atan().to_degrees()),
        "sqrt" => {
            if value < 0.0 {
                return Err("Cannot sqrt a negative number".into());
            }
            Ok(value.sqrt())
        }
        "cbrt" => Ok(value.cbrt()),
        "ln" => {
            if value <= 0.0 {
                return Err("ln requires positive input".into());
            }
            Ok(value.ln())
        }
        "log10" => {
            if value <= 0.0 {
                return Err("log10 requires positive input".into());
            }
            Ok(value.log10())
        }
        "log2" => {
            if value <= 0.0 {
                return Err("log2 requires positive input".into());
            }
            Ok(value.log2())
        }
        "abs" => Ok(value.abs()),
        "factorial" => {
            if value < 0.0 || value != value.floor() || value > 170.0 {
                return Err("Factorial requires integer 0-170".into());
            }
            Ok(factorial(value as u64))
        }
        "exp" => Ok(value.exp()),
        "inv" => {
            if value == 0.0 {
                return Err("Cannot divide by zero".into());
            }
            Ok(1.0 / value)
        }
        "square" => Ok(value * value),
        "cube" => Ok(value * value * value),
        "percent" => Ok(value / 100.0),
        "negate" => Ok(-value),
        _ => Err(format!("Unknown function: {}", func)),
    }
}

pub fn get_constant(name: &str) -> Result<f64, String> {
    match name {
        "pi" => Ok(std::f64::consts::PI),
        "e" => Ok(std::f64::consts::E),
        "tau" => Ok(std::f64::consts::TAU),
        "phi" => Ok(1.618_033_988_749_895),
        "sqrt2" => Ok(std::f64::consts::SQRT_2),
        _ => Err(format!("Unknown constant: {}", name)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ---- format_number tests ----

    #[test]
    fn format_integer() {
        assert_eq!(format_number(42.0), "42");
    }

    #[test]
    fn format_negative_integer() {
        assert_eq!(format_number(-7.0), "-7");
    }

    #[test]
    fn format_zero() {
        assert_eq!(format_number(0.0), "0");
    }

    #[test]
    fn format_decimal() {
        assert_eq!(format_number(3.14), "3.14");
    }

    #[test]
    fn format_strips_trailing_zeros() {
        assert_eq!(format_number(2.50), "2.5");
    }

    #[test]
    fn format_nan() {
        assert_eq!(format_number(f64::NAN), "NaN");
    }

    #[test]
    fn format_positive_infinity() {
        assert_eq!(format_number(f64::INFINITY), "Infinity");
    }

    #[test]
    fn format_negative_infinity() {
        assert_eq!(format_number(f64::NEG_INFINITY), "-Infinity");
    }

    #[test]
    fn format_large_integer() {
        assert_eq!(format_number(1000000.0), "1000000");
    }

    #[test]
    fn format_very_large_uses_decimal() {
        // Beyond i64-safe threshold, falls through to decimal formatting
        let result = format_number(1e16);
        assert!(result.contains("1"));
    }

    // ---- factorial tests ----

    #[test]
    fn factorial_zero() {
        assert_eq!(factorial(0), 1.0);
    }

    #[test]
    fn factorial_one() {
        assert_eq!(factorial(1), 1.0);
    }

    #[test]
    fn factorial_five() {
        assert_eq!(factorial(5), 120.0);
    }

    #[test]
    fn factorial_ten() {
        assert_eq!(factorial(10), 3628800.0);
    }

    #[test]
    fn factorial_twenty() {
        assert_eq!(factorial(20), 2432902008176640000.0);
    }

    // ---- scientific_fn tests ----

    #[test]
    fn sci_sin_0() {
        let r = scientific_fn("sin", 0.0).unwrap();
        assert!(r.abs() < 1e-10);
    }

    #[test]
    fn sci_sin_90() {
        let r = scientific_fn("sin", 90.0).unwrap();
        assert!((r - 1.0).abs() < 1e-10);
    }

    #[test]
    fn sci_cos_0() {
        let r = scientific_fn("cos", 0.0).unwrap();
        assert!((r - 1.0).abs() < 1e-10);
    }

    #[test]
    fn sci_cos_90() {
        let r = scientific_fn("cos", 90.0).unwrap();
        assert!(r.abs() < 1e-10);
    }

    #[test]
    fn sci_tan_45() {
        let r = scientific_fn("tan", 45.0).unwrap();
        assert!((r - 1.0).abs() < 1e-10);
    }

    #[test]
    fn sci_sqrt() {
        assert_eq!(scientific_fn("sqrt", 25.0).unwrap(), 5.0);
    }

    #[test]
    fn sci_sqrt_negative() {
        assert!(scientific_fn("sqrt", -4.0).is_err());
    }

    #[test]
    fn sci_cbrt() {
        let r = scientific_fn("cbrt", 27.0).unwrap();
        assert!((r - 3.0).abs() < 1e-10);
    }

    #[test]
    fn sci_ln_e() {
        let r = scientific_fn("ln", std::f64::consts::E).unwrap();
        assert!((r - 1.0).abs() < 1e-10);
    }

    #[test]
    fn sci_ln_negative() {
        assert!(scientific_fn("ln", -1.0).is_err());
    }

    #[test]
    fn sci_log10() {
        assert_eq!(scientific_fn("log10", 100.0).unwrap(), 2.0);
    }

    #[test]
    fn sci_log2() {
        assert_eq!(scientific_fn("log2", 8.0).unwrap(), 3.0);
    }

    #[test]
    fn sci_square() {
        assert_eq!(scientific_fn("square", 7.0).unwrap(), 49.0);
    }

    #[test]
    fn sci_cube() {
        assert_eq!(scientific_fn("cube", 3.0).unwrap(), 27.0);
    }

    #[test]
    fn sci_inv() {
        assert_eq!(scientific_fn("inv", 4.0).unwrap(), 0.25);
    }

    #[test]
    fn sci_inv_zero() {
        assert!(scientific_fn("inv", 0.0).is_err());
    }

    #[test]
    fn sci_factorial() {
        assert_eq!(scientific_fn("factorial", 5.0).unwrap(), 120.0);
    }

    #[test]
    fn sci_factorial_negative() {
        assert!(scientific_fn("factorial", -1.0).is_err());
    }

    #[test]
    fn sci_factorial_non_integer() {
        assert!(scientific_fn("factorial", 3.5).is_err());
    }

    #[test]
    fn sci_exp() {
        let r = scientific_fn("exp", 1.0).unwrap();
        assert!((r - std::f64::consts::E).abs() < 1e-10);
    }

    #[test]
    fn sci_abs() {
        assert_eq!(scientific_fn("abs", -42.0).unwrap(), 42.0);
    }

    #[test]
    fn sci_percent() {
        assert_eq!(scientific_fn("percent", 50.0).unwrap(), 0.5);
    }

    #[test]
    fn sci_negate() {
        assert_eq!(scientific_fn("negate", 5.0).unwrap(), -5.0);
    }

    #[test]
    fn sci_asin() {
        let r = scientific_fn("asin", 1.0).unwrap();
        assert!((r - 90.0).abs() < 1e-10);
    }

    #[test]
    fn sci_asin_domain_error() {
        assert!(scientific_fn("asin", 2.0).is_err());
    }

    #[test]
    fn sci_acos() {
        let r = scientific_fn("acos", 0.0).unwrap();
        assert!((r - 90.0).abs() < 1e-10);
    }

    #[test]
    fn sci_atan() {
        let r = scientific_fn("atan", 1.0).unwrap();
        assert!((r - 45.0).abs() < 1e-10);
    }

    #[test]
    fn sci_unknown_function() {
        assert!(scientific_fn("foobar", 1.0).is_err());
    }

    // ---- get_constant tests ----

    #[test]
    fn constant_pi() {
        assert!((get_constant("pi").unwrap() - std::f64::consts::PI).abs() < 1e-15);
    }

    #[test]
    fn constant_e() {
        assert!((get_constant("e").unwrap() - std::f64::consts::E).abs() < 1e-15);
    }

    #[test]
    fn constant_tau() {
        assert!((get_constant("tau").unwrap() - std::f64::consts::TAU).abs() < 1e-15);
    }

    #[test]
    fn constant_phi() {
        assert!((get_constant("phi").unwrap() - 1.618033988749895).abs() < 1e-15);
    }

    #[test]
    fn constant_unknown() {
        assert!(get_constant("foo").is_err());
    }
}
