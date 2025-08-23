import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required for mobile authentication');
}

interface JWTPayload {
  userId: string;
  role: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const signMobileJwt = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyMobileJwt = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const getUserFromBearer = async (req: Request): Promise<UserData> => {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  try {
    const payload = verifyMobileJwt(token);
    
    // Load user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Helper function for dual authentication (web session OR mobile JWT)
export const requireUserMobile = async (req: Request): Promise<UserData> => {
  try {
    // First try to get from NextAuth session (web app)
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return {
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role as string,
      };
    }
    
    // If no web session, try mobile JWT
    return await getUserFromBearer(req);
  } catch (error) {
    throw new Error('Unauthorized');
  }
};
