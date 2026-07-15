import os
from playwright.sync_api import sync_playwright

OUT = r"C:\Users\JARABOOM\AppData\Local\Temp\claude\C--Users-JARABOOM\6b688980-8e8f-4518-bbcc-9f354f876de5\scratchpad\shots"
os.makedirs(OUT, exist_ok=True)
URL = "http://localhost:5173"; PIN = "220923"; errors = []

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    ctx = b.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append("CONS:"+m.text) if m.type=="error" else None)
    page.goto(URL); page.wait_for_load_state("networkidle"); page.wait_for_timeout(600)
    page.screenshot(path=f"{OUT}/e1-pin.png")
    for d in PIN:
        page.get_by_role("button", name=d, exact=True).first.click(); page.wait_for_timeout(90)
    page.wait_for_timeout(1400)
    page.screenshot(path=f"{OUT}/e2-portal.png")

    def openf(l): page.get_by_text(l, exact=False).first.click(); page.wait_for_timeout(1400)
    def back():
        bk=page.get_by_role("button", name="หน้าหลัก")
        if bk.count(): bk.first.click(); page.wait_for_timeout(700)

    openf("นับวันรัก"); page.wait_for_timeout(1200); page.screenshot(path=f"{OUT}/e3-days.png"); back()
    openf("จิ๊กซอว์"); page.wait_for_timeout(600)
    # hold peek button
    pk = page.get_by_text("ดูตัวอย่าง")
    if pk.count():
        bb = pk.first.bounding_box()
        page.mouse.move(bb["x"]+bb["width"]/2, bb["y"]+bb["height"]/2); page.mouse.down(); page.wait_for_timeout(400)
        page.screenshot(path=f"{OUT}/e4-jigsaw-peek.png"); page.mouse.up()
    page.wait_for_timeout(300); page.screenshot(path=f"{OUT}/e4-jigsaw.png"); back()
    openf("ซองจดหมาย"); page.wait_for_timeout(400)
    page.get_by_role("button", name="เปิดซองจดหมาย").click(force=True); page.wait_for_timeout(2200)
    page.screenshot(path=f"{OUT}/e5-letter.png")
    b.close()
print("ERRORS:", errors if errors else "none")
