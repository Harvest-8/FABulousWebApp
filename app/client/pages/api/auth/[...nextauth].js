import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

let userAccount = null;

export default NextAuth({
    cookie: {
        secure: process.env.NODE_ENV && process.env.NODE_ENV === 'production',
    },
    redirect: false,
    session: {
        jwt: true,
        maxAge: 30 * 24 * 60 * 60
    },
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
            email: { label: "Email", type: "email", placeholder: "Email" },
            password: {  label: "Password", type: "password", placeholder: "Password" }
            },
            async authorize(credentials, req) {

                try{
                    const user = await axios.post('http://localhost:3001/login', {email: credentials.email, password: credentials.password})
            
                    if (!user.data.error && user.data.user) {
                        userAccount = {
                            user_id: user.data.user.id,
                            name: user.data.user.name,
                            email: user.data.user.email
                        }
                        return userAccount
                    } else {
                        return null
                    }
                }catch(err){
                    console.log("Authorize error:", err);
                }
            }
        }),
        // ...add more providers here
    ],
    callbacks: {
        async signIn(user, account, profile){
            try{
                user = user.user
                if(user.id !== typeof undefined){
                    return user;
                }else{
                    console.log("User undefined")
                    return false;
                }
            }catch (err){
                console.error("Signin callback error:", err);
            }
        },
        async register(name, email, password) {
            try
            {
                await axios.post('http://localhost:3001/register', {name, email, password});
                return true;
            }
            catch (err)
            {
                console.error("Failed to register user. Error", err);
                return false;
            }

        },
        async session({session, token}) {
            if (userAccount !== null){
                session.user = {
                    user_id: userAccount.user_id,
                    name: userAccount.name,
                    email: userAccount.email
                }
            }else if (typeof token.user !== typeof undefined && (typeof session.user === typeof undefined || (typeof session.user !== typeof undefined && typeof session.user.user_id === typeof undefined))){
                session.user = token.user;
            }else if (typeof token !== typeof undefined){
                session.token = token;
            }
            return session;
        },
        async jwt(params) {
            if (typeof params.user !== typeof undefined)
            {
                params.token.user = params.user;
            }
            return params.token;
        }
    },
    pages:{
        newUser: "/Register",
        signIn:"/Signin",
    }
})