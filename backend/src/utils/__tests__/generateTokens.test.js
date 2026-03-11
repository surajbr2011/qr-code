const { generateAccessToken, generateRefreshToken } = require('../generateTokens');
const jwt = require('jsonwebtoken');

describe('token generation', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_REFRESH_SECRET = 'refreshsecret';
  });

  test('generateAccessToken returns a valid JWT', () => {
    const token = generateAccessToken('12345');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('12345');
  });

  test('generateRefreshToken returns a valid JWT', () => {
    const token = generateRefreshToken('abc');
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    expect(decoded.id).toBe('abc');
  });
});
