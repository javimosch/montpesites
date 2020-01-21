module.exports = app =>
    async function health() {
        return {
            status: 'alive'
        }
    }