/// Expression tokenizer and recursive-descent parser.
///
/// Grammar:
///   expr     = addition
///   addition = multiplication (('+' | '-') multiplication)*
///   multiply = power (('*' | '/' | '%') power)*
///   power    = unary ('^' unary)?
///   unary    = ('-' | '+')? primary
///   primary  = NUMBER | '(' expr ')'

#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Number(f64),
    Plus,
    Minus,
    Multiply,
    Divide,
    Power,
    Modulo,
    LParen,
    RParen,
}

pub fn tokenize(expr: &str) -> Result<Vec<Token>, String> {
    let mut tokens = Vec::new();
    let chars: Vec<char> = expr.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        match chars[i] {
            ' ' => i += 1,
            '+' => { tokens.push(Token::Plus); i += 1; }
            '-' => { tokens.push(Token::Minus); i += 1; }
            '*' | '\u{00d7}' => { tokens.push(Token::Multiply); i += 1; }
            '/' | '\u{00f7}' => { tokens.push(Token::Divide); i += 1; }
            '^' => { tokens.push(Token::Power); i += 1; }
            '(' => { tokens.push(Token::LParen); i += 1; }
            ')' => { tokens.push(Token::RParen); i += 1; }
            '%' => { tokens.push(Token::Modulo); i += 1; }
            c if c.is_ascii_digit() || c == '.' => {
                let start = i;
                while i < chars.len() && (chars[i].is_ascii_digit() || chars[i] == '.') {
                    i += 1;
                }
                let num_str: String = chars[start..i].iter().collect();
                let num: f64 = num_str
                    .parse()
                    .map_err(|_| format!("Invalid number: {}", num_str))?;
                tokens.push(Token::Number(num));
            }
            c => return Err(format!("Unexpected character: {}", c)),
        }
    }
    Ok(tokens)
}

pub fn eval_expression(expr: &str) -> Result<f64, String> {
    let tokens = tokenize(expr)?;
    if tokens.is_empty() {
        return Err("Empty expression".into());
    }
    let mut pos = 0;
    let result = parse_addition(&tokens, &mut pos)?;
    if pos < tokens.len() {
        return Err(format!("Unexpected token: {:?}", tokens[pos]));
    }
    Ok(result)
}

fn parse_addition(tokens: &[Token], pos: &mut usize) -> Result<f64, String> {
    let mut left = parse_multiplication(tokens, pos)?;
    while *pos < tokens.len() {
        match tokens[*pos] {
            Token::Plus => { *pos += 1; left += parse_multiplication(tokens, pos)?; }
            Token::Minus => { *pos += 1; left -= parse_multiplication(tokens, pos)?; }
            _ => break,
        }
    }
    Ok(left)
}

fn parse_multiplication(tokens: &[Token], pos: &mut usize) -> Result<f64, String> {
    let mut left = parse_power(tokens, pos)?;
    while *pos < tokens.len() {
        match tokens[*pos] {
            Token::Multiply => { *pos += 1; left *= parse_power(tokens, pos)?; }
            Token::Divide => {
                *pos += 1;
                let right = parse_power(tokens, pos)?;
                if right == 0.0 {
                    return Err("Division by zero".into());
                }
                left /= right;
            }
            Token::Modulo => {
                *pos += 1;
                let right = parse_power(tokens, pos)?;
                if right == 0.0 {
                    return Err("Modulo by zero".into());
                }
                left %= right;
            }
            _ => break,
        }
    }
    Ok(left)
}

fn parse_power(tokens: &[Token], pos: &mut usize) -> Result<f64, String> {
    let base = parse_unary(tokens, pos)?;
    if *pos < tokens.len() {
        if let Token::Power = tokens[*pos] {
            *pos += 1;
            let exp = parse_unary(tokens, pos)?;
            return Ok(base.powf(exp));
        }
    }
    Ok(base)
}

fn parse_unary(tokens: &[Token], pos: &mut usize) -> Result<f64, String> {
    if *pos >= tokens.len() {
        return Err("Unexpected end of expression".into());
    }
    match tokens[*pos] {
        Token::Minus => {
            *pos += 1;
            let val = parse_primary(tokens, pos)?;
            Ok(-val)
        }
        Token::Plus => {
            *pos += 1;
            parse_primary(tokens, pos)
        }
        _ => parse_primary(tokens, pos),
    }
}

fn parse_primary(tokens: &[Token], pos: &mut usize) -> Result<f64, String> {
    if *pos >= tokens.len() {
        return Err("Unexpected end of expression".into());
    }
    match &tokens[*pos] {
        Token::Number(n) => {
            let val = *n;
            *pos += 1;
            Ok(val)
        }
        Token::LParen => {
            *pos += 1;
            let val = parse_addition(tokens, pos)?;
            if *pos >= tokens.len() {
                return Err("Missing closing parenthesis".into());
            }
            if let Token::RParen = tokens[*pos] {
                *pos += 1;
                Ok(val)
            } else {
                Err("Expected closing parenthesis".into())
            }
        }
        other => Err(format!("Unexpected token: {:?}", other)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ---- Tokenizer tests ----

    #[test]
    fn tokenize_simple_number() {
        let tokens = tokenize("42").unwrap();
        assert_eq!(tokens, vec![Token::Number(42.0)]);
    }

    #[test]
    fn tokenize_decimal() {
        let tokens = tokenize("3.14").unwrap();
        assert_eq!(tokens, vec![Token::Number(3.14)]);
    }

    #[test]
    fn tokenize_operators() {
        let tokens = tokenize("2 + 3 * 4").unwrap();
        assert_eq!(tokens, vec![
            Token::Number(2.0), Token::Plus,
            Token::Number(3.0), Token::Multiply,
            Token::Number(4.0),
        ]);
    }

    #[test]
    fn tokenize_unicode_operators() {
        let tokens = tokenize("6\u{00f7}3").unwrap();
        assert_eq!(tokens, vec![Token::Number(6.0), Token::Divide, Token::Number(3.0)]);

        let tokens = tokenize("6\u{00d7}3").unwrap();
        assert_eq!(tokens, vec![Token::Number(6.0), Token::Multiply, Token::Number(3.0)]);
    }

    #[test]
    fn tokenize_parens() {
        let tokens = tokenize("(1+2)").unwrap();
        assert_eq!(tokens, vec![
            Token::LParen, Token::Number(1.0), Token::Plus, Token::Number(2.0), Token::RParen,
        ]);
    }

    #[test]
    fn tokenize_invalid_char() {
        assert!(tokenize("2 & 3").is_err());
    }

    // ---- Expression evaluator tests ----

    #[test]
    fn eval_single_number() {
        assert_eq!(eval_expression("42").unwrap(), 42.0);
    }

    #[test]
    fn eval_addition() {
        assert_eq!(eval_expression("2 + 3").unwrap(), 5.0);
    }

    #[test]
    fn eval_subtraction() {
        assert_eq!(eval_expression("10 - 3").unwrap(), 7.0);
    }

    #[test]
    fn eval_multiplication() {
        assert_eq!(eval_expression("4 * 5").unwrap(), 20.0);
    }

    #[test]
    fn eval_division() {
        assert_eq!(eval_expression("15 / 3").unwrap(), 5.0);
    }

    #[test]
    fn eval_division_by_zero() {
        assert!(eval_expression("5 / 0").is_err());
    }

    #[test]
    fn eval_operator_precedence() {
        assert_eq!(eval_expression("2 + 3 * 4").unwrap(), 14.0);
    }

    #[test]
    fn eval_parentheses() {
        assert_eq!(eval_expression("(2 + 3) * 4").unwrap(), 20.0);
    }

    #[test]
    fn eval_nested_parentheses() {
        assert_eq!(eval_expression("((2 + 3) * (4 - 1))").unwrap(), 15.0);
    }

    #[test]
    fn eval_power() {
        assert_eq!(eval_expression("2 ^ 10").unwrap(), 1024.0);
    }

    #[test]
    fn eval_modulo() {
        assert_eq!(eval_expression("17 % 5").unwrap(), 2.0);
    }

    #[test]
    fn eval_negative_number() {
        assert_eq!(eval_expression("-5").unwrap(), -5.0);
    }

    #[test]
    fn eval_negative_in_expression() {
        assert_eq!(eval_expression("3 + -2").unwrap(), 1.0);
    }

    #[test]
    fn eval_unary_plus() {
        assert_eq!(eval_expression("+5").unwrap(), 5.0);
    }

    #[test]
    fn eval_complex_expression() {
        let result = eval_expression("(10 + 5) * 2 - 3 ^ 2").unwrap();
        assert_eq!(result, 21.0);
    }

    #[test]
    fn eval_decimal_arithmetic() {
        let result = eval_expression("0.1 + 0.2").unwrap();
        assert!((result - 0.3).abs() < 1e-10);
    }

    #[test]
    fn eval_empty_expression() {
        assert!(eval_expression("").is_err());
    }

    #[test]
    fn eval_missing_closing_paren() {
        assert!(eval_expression("(2 + 3").is_err());
    }

    #[test]
    fn eval_trailing_operator() {
        assert!(eval_expression("5 +").is_err());
    }

    #[test]
    fn eval_consecutive_operators() {
        // "5 * -3" should work (unary minus)
        assert_eq!(eval_expression("5 * -3").unwrap(), -15.0);
    }
}
