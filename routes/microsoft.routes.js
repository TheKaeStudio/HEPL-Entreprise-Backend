const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("qs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const FRONT_URL = process.env.FRONT_URL;

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const TENANT_ID = process.env.MICROSOFT_TENANT_ID;
const REDIRECT_URI = "http://localhost:3000/auth/microsoft/callback";

router.get("/", (req, res) => {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        response_mode: "query",
        scope: "openid profile email",
    });

    res.redirect(
        `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize?${params}`,
    );
});

router.get("/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("No code provided");

    try {
        const tokenRes = await axios.post(
            `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
            qs.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                scope: "openid profile email",
                code,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
        );

        const { id_token, access_token } = tokenRes.data;

        const payload = JSON.parse(
            Buffer.from(id_token.split(".")[1], "base64").toString(),
        );

        let user = await User.findOne({ email: payload.preferred_username });
        if (!user) {
            user = await User.create({
                name: payload.name,
                email: payload.preferred_username,
                role: "limited",
            });
        }

        const appToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" },
        );

        res.redirect(`${FRONT_URL}/?token=${appToken}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur Microsoft OAuth");
    }
});

module.exports = router;
