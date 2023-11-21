export const handleRoot = (req, res) => {
    res.send('Hello from Express!');
};

export const handleSendMessage = (req, res) => {
    const { message } = req.body;
    res.json({ status: 'Message received by Express', message });
};