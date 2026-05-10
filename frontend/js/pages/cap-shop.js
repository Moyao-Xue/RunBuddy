initShopItemPage({
    itemId: 'blue_cap',
    itemPrice: 30
});

document.querySelectorAll('.hotspot[data-href]').forEach((button) => {
    if (button.dataset.bound === 'true') {
        return;
    }

    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
        location.href = button.dataset.href;
    });
});
