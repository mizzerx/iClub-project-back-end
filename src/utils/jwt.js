import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';

const privateKey = readFileSync('rsa_private.pem');
const publicKey = readFileSync('rsa_public.pem');

export default {
  sign: (payload, expiresIn) => {
    return jwt.sign(payload, privateKey, { expiresIn, algorithm: 'RS256' });
  },
  verify: (token) => {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  },
};
