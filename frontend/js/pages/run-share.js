function shareTo(platform) {
    const shareText = "Check out my running achievement on RunBuddy!";
    const shareUrl = window.location.href;

    const urls = {
        wechat: `https://api.addthis.com/oexchange/forward?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
        weibo: `http://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
        qq: `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
        moments: `https://api.addthis.com/oexchange/forward?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
        tiktok: `https://www.tiktok.com/share?url=${encodeURIComponent(shareUrl)}`
    };

    if (platform === "wechat" || platform === "moments") {
        showToast("Use browser share menu to share to WeChat/Moments");

        if (navigator.share) {
            navigator.share({
                title: "My Running Record",
                text: shareText,
                url: shareUrl
            }).catch(() => {});
        }

        return;
    }

    window.open(urls[platform], "_blank", "width=600,height=500");
}

function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showToast("Link copied!");
    }).catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showToast("Link copied!");
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}