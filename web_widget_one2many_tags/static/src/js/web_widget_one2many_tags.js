//© 2017 Therp BV <http://therp.nl>
//© 2019 XCG <http://xcg-consulting.fr>
//License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

odoo.define('web_widget_one2many_tags.One2ManyTags', function (require) {
"use strict";

    var core = require('web.core');
    var registry = require('web.field_registry');
    var relational_fields = require('web.relational_fields');
    var _t = core._t;

    var FieldOne2ManyTags = relational_fields.FieldMany2ManyTags.extend({
        tag_template: "FieldOne2ManyTag",
        className: "o_field_one2manytags",
        supportedFieldTypes: ['one2many'],

    });

    // Relational field
    registry.add('one2many_tags', FieldOne2ManyTags);
});
