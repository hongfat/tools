function updateDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    const displayElement = document.getElementById('datetime-display');
    if (displayElement) {
        displayElement.textContent = dateTimeString;
    }
}
// 立即執行一次，然後每秒更新
updateDateTime();
setInterval(updateDateTime, 1000);

const sidebar = document.getElementById("mySidebar");
const mainContent = document.getElementById("main-content");

/* Toggle between showing and hiding the sidebar */
function toggleNav(event) {
    event.stopPropagation(); // 阻止事件冒泡到 main-content
    if (sidebar.style.width === "250px") {
        closeNav();
    } else {
        openNav();
    }
}

function openNav() {
    sidebar.style.width = "250px";
}

function closeNav() {
    sidebar.style.width = "0";
}

mainContent.addEventListener('click', closeNav);