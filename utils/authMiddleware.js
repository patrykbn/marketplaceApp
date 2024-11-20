const Session = require('../models/session.model');
const authMiddleware = async (req, res, next) => {
    if (process.env.NODE_ENV !== "production") {
        try {
            const sessionRecord = await Session.findOne({}); // Znajdź ostatnią sesję
            if (!sessionRecord)
                return res.status(401).send({ message: 'You are not authorized' });

            const sessionData = JSON.parse(sessionRecord.session);
            req.session.user = {
                id: sessionData.user.id,
                email: sessionData.user.email,
            };
            return next();
        } catch (err) {
            return res.status(401).send({ message: 'You are not authorized' });
        }
    } else {
        if (req.session.user) {
            return next();
        } else {
            res.status(401).send({ message: 'You are not authorized' });
        }
    }
};

module.exports = authMiddleware;