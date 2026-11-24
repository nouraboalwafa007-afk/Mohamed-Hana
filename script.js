/* ---- الإعدادات: غيّر القيم دي بس ---- */
const CONFIG = {
  // رقم واتساب اللي بيستقبل تأكيدات الحضور (بالصيغة الدولية من غير + أو 00)
  whatsapp: "201050719571",
  // اختياري: لو عايز التأكيدات توصل لإيميلك بدل واتساب، اعمل فورم على formspree.io وحط الرابط هنا (https://formspree.io/f/xxxx)
  formEndpoint: "",
  title: "حفل زفاف محمد وهنا",
  place: "قاعة 25 يناير، طريق البلاجات",
  mapUrl: "https://maps.app.goo.gl/WuwwBKgtWrYztsabA?g_st=ac",
  // 7م إلى 11م بتوقيت القاهرة (UTC+2 في يناير)
  startUTC: "20270101T170000Z",
  endUTC: "20270101T210000Z",
  target: "2027-01-01T19:00:00+02:00"
};

const $ = (id) => document.getElementById(id);
const nf = new Intl.NumberFormat("ar-EG");

/* envelope */
function openInvite() {
  if ($("env").classList.contains("open")) return;
  $("env").classList.add("open");
  $("hint").style.opacity = 0;
  setTimeout(() => {
    $("intro").classList.add("gone");
    document.body.classList.remove("locked");
    $("main").classList.add("show");
    window.scrollTo(0, 0);
  }, 2300);
}
$("seal").addEventListener("click", openInvite);
/* يفتح الظرف لوحده لو محدش ضغط */
setTimeout(openInvite, 4500);

/* countdown */
const target = new Date(CONFIG.target).getTime();
function tick() {
  let diff = target - Date.now();
  if (diff <= 0) {
    $("count").style.display = "none";
    $("cd-done").style.display = "block";
    return;
  }
  const s = Math.floor(diff / 1000);
  $("cd-d").textContent = nf.format(Math.floor(s / 86400));
  $("cd-h").textContent = nf.format(Math.floor((s % 86400) / 3600));
  $("cd-m").textContent = nf.format(Math.floor((s % 3600) / 60));
  $("cd-s").textContent = nf.format(s % 60);
}
tick();
setInterval(tick, 1000);

/* calendar */
$("gcal").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent(CONFIG.title) +
  "&dates=" + CONFIG.startUTC + "/" + CONFIG.endUTC +
  "&location=" + encodeURIComponent(CONFIG.place) +
  "&details=" + encodeURIComponent("الخريطة: " + CONFIG.mapUrl);
$("ics").addEventListener("click", () => {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invite//AR", "BEGIN:VEVENT",
    "UID:mh-wedding-20270101@invite", "DTSTAMP:" + CONFIG.startUTC,
    "DTSTART:" + CONFIG.startUTC, "DTEND:" + CONFIG.endUTC,
    "SUMMARY:" + CONFIG.title, "LOCATION:" + CONFIG.place,
    "DESCRIPTION:" + CONFIG.mapUrl,
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:" + CONFIG.title, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  a.download = "mohamed-hana-wedding.ics";
  document.body.appendChild(a); a.click(); a.remove();
});

/* RSVP */
const att = () => document.querySelector('input[name="att"]:checked').value;
document.querySelectorAll('input[name="att"]').forEach((r) =>
  r.addEventListener("change", () => { $("g-wrap").style.display = att() === "yes" ? "grid" : "none"; }));

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("f-name").value.trim();
  $("err").style.display = name ? "none" : "block";
  if (!name) return;
  const yes = att() === "yes";
  const guests = Math.max(1, parseInt($("f-guests").value, 10) || 1);
  const msg = $("f-msg").value.trim();
  const text = [
    "تأكيد حضور: زفاف محمد وهنا (1/1/2027)",
    "الاسم: " + name,
    yes ? "الحضور: هحضر، العدد " + guests : "الحضور: مش هقدر أحضر",
    msg ? "رسالة: " + msg : ""
  ].filter(Boolean).join("\n");

  if (CONFIG.formEndpoint) {
    try {
      const r = await fetch(CONFIG.formEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, attending: yes, guests: yes ? guests : 0, message: msg })
      });
      if (!r.ok) throw new Error();
      $("thanks").textContent = "شكرًا ليك! وصل تأكيدك.";
      $("thanks").style.display = "block";
      return;
    } catch (_) { /* لو فشل نكمل على واتساب */ }
  }
  window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text), "_blank");
  $("thanks").style.display = "block";
});
