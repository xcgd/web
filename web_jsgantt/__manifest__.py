# SPDX-FileCopyrightText: 2024 Coop IT Easy SC
#
# SPDX-License-Identifier: AGPL-3.0-or-later

{
    "name": "JSGantt View",
    "summary": "Add a Gantt view type using jsgantt-improved",
    "version": "16.0.2.0.1",
    "category": "Hidden",
    "website": "https://github.com/OCA/web",
    "author": "Coop IT Easy SC, XCG Consulting, Odoo Community Association (OCA)",
    "license": "AGPL-3",
    "development_status": "Alpha",
    "depends": ["web"],
    "assets": {
        "web.assets_backend": [
            "web_jsgantt/static/lib/jsgantt-improved/dist/*",
            "web_jsgantt/static/src/views/**/*",
            "web_jsgantt/static/src/scss/web_jsgantt.scss",
            "web_jsgantt/static/src/scss/jsgantt_widget.scss",
        ],
    },
    "demo": ["demo/ir_cron_view.xml"],
}
