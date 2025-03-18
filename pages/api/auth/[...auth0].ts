import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';

export default handleAuth({
  callback: handleCallback({
    afterCallback: (req, res, session) => {
      // Redirect to the home page after successful login
      res.setHeader('Location', '/');
      return session;
    }
  })
}); 