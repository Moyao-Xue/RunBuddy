// Item configuration
        const ITEM_PRICE = 60;
        const ITEM_ID = 'red_jacket';

        // Initialize page
        function init() {
            updateCoinDisplay();
            updateBuyButton();
        }

        // Update coin display
        function updateCoinDisplay() {
            const stats = Storage.getStats();
            document.getElementById('coinCount').textContent = stats.totalCoins;
        }

        // Check if item is owned
        function isItemOwned() {
            const ownedItems = JSON.parse(localStorage.getItem('runbuddy_owned_items') || '[]');
            return ownedItems.includes(ITEM_ID);
        }

        // Purchase item
        function purchaseItem() {
            const stats = Storage.getStats();
            
            if (stats.totalCoins < ITEM_PRICE) {
                showNotification('Not enough coins!');
                return false;
            }

            if (isItemOwned()) {
                showNotification('You already own this item!');
                return false;
            }

            // Deduct coins
            stats.totalCoins -= ITEM_PRICE;
            Storage.saveStats(stats);

            // Add to owned items
            const ownedItems = JSON.parse(localStorage.getItem('runbuddy_owned_items') || '[]');
            ownedItems.push(ITEM_ID);
            localStorage.setItem('runbuddy_owned_items', JSON.stringify(ownedItems));

            // Update display
            updateCoinDisplay();
            updateBuyButton();
            showNotification('Purchase successful!');
            return true;
        }

        // Update buy button state
        function updateBuyButton() {
            const btn = document.getElementById('buyBtn');
            if (isItemOwned()) {
                btn.textContent = 'Owned';
                btn.classList.add('owned');
                btn.disabled = true;
            } else {
                const stats = Storage.getStats();
                if (stats.totalCoins < ITEM_PRICE) {
                    btn.textContent = 'Not enough coins';
                    btn.disabled = true;
                } else {
                    btn.textContent = `Buy - ${ITEM_PRICE} Coins`;
                    btn.disabled = false;
                }
            }
        }

        // Show notification
        function showNotification(message) {
            const notif = document.getElementById('notification');
            notif.textContent = message;
            notif.classList.add('show');
            setTimeout(() => {
                notif.classList.remove('show');
            }, 2000);
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', init);
        document.getElementById('buyBtn').addEventListener('click', purchaseItem);
