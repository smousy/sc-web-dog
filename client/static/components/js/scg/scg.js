GwfFileCreate = {

    scene: null,
    fileString: null,

    createFile: function (scene) {
        this.scene = scene;
        this.fileString = "";
        var self = this;
        this.addHeaderFile();
        this.scene.contours.forEach(function (counter) {
            self.createContour(counter);
        });
        this.scene.nodes.forEach(function (node) {
            self.createNode(node);
        });
        this.scene.buses.forEach(function (bus) {
            self.createBus(bus);
        });
        this.scene.links.forEach(function (link) {
            self.createLink(link);
        });
        this.scene.edges.forEach(function (edge) {
            self.createEdge(edge);
        });
        this.addEndFile();
        return this.fileString;
    },

    createFileWithSelectedObject: function (scene) {

        function selectedFilter(object) {
            return object.is_selected;
        }

        function selectedFilterForBus(bus) {
            return bus.is_selected && bus.source.is_selected;
        }

        function selectedFilterForEdges(edge) {
            return edge.is_selected && edge.source.is_selected && edge.target.is_selected;
        }

        function fixParents(text) {
            var results = text.match(/parent="(\d+)"/g) || [];
            results.forEach(function (string) {
                var id = string.match(/\d+/)[0] || 0;
                if (id !== 0) {
                    var index = text.indexOf('id="' + id + '"');
                    if (index == -1) {
                        text = text.replace(new RegExp('parent="' + id + '"', 'g'), 'parent="0"');
                    }
                }
            });
            return text;
        }

        this.scene = scene;
        this.fileString = "";
        var self = this;
        this.addHeaderFile();
        this.scene.contours.filter(selectedFilter).forEach(function (counter) {
            self.createContour(counter);
        });
        this.scene.nodes.filter(selectedFilter).forEach(function (node) {
            self.createNode(node);
        });
        this.scene.buses.filter(selectedFilterForBus).forEach(function (bus) {
            self.createBus(bus);
        });
        this.scene.links.filter(selectedFilter).forEach(function (link) {
            self.createLink(link);
        });
        this.scene.edges.filter(selectedFilterForEdges).forEach(function (edge) {
            self.createEdge(edge);
        });
        this.addEndFile();
        this.fileString = fixParents(this.fileString);
        return this.fileString;
    },

    addHeaderFile: function () {
        this.fileString +=
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<GWF version="2.0">\n' +
            '    <staticSector>\n';
    },

    addEndFile: function () {
        this.fileString +=
            '    </staticSector>\n' +
            '</GWF>\n';
    },

    createNode: function (node) {
        this.fileString +=
            '       <node type="' + this.getTypeObject(node) + '" idtf="' + this.getIdtf(node) + '" shapeColor="0" id="' + this.getIdObject(node) + '" parent="' + this.haveParent(node) + '" left="0" top="0" right="16.125" bottom="25" textColor="164" text_angle="0" text_font="Times New Roman [Arial]" font_size="10" x="' + node.position.x + '" y="' + node.position.y + '" haveBus="' + this.haveBus(node) + '" idtf_pos="0">\n' +
            '           <content type="0" mime_type="" content_visibility="false" file_name=""/>\n' +
            '       </node>\n';
    },

    createEdge: function (edge) {
        this.fileString +=
            '       <arc type="' + this.getTypeObject(edge) + '" idtf="" shapeColor="0" id="' + this.getIdObject(edge) + '" parent="' + this.haveParent(edge) + '" id_b="' + this.getIdObject(edge.source) + '" id_e="' + this.getIdObject(edge.target) + '" b_x="' + edge.source_pos.x + '" b_y="' + edge.source_pos.y + '" e_x="' + edge.target_pos.x + '" e_y="' + edge.target_pos.y + '" dotBBalance="' + edge.source_dot + '" dotEBalance="' + edge.target_dot + '">\n';
        this.addPoints(edge);
        this.fileString +=
            '       </arc>\n';
    },

    createBus: function (bus) {
        this.fileString +=
            '       <bus type="" idtf="" shapeColor="0" id="' + this.getIdBus(bus) + '" parent="' + this.haveParent(bus) + '" owner="' + this.getIdObject(bus.source) + '" b_x="' + bus.source_pos.x + '" b_y="' + bus.source_pos.y + '" e_x="' + bus.target_pos.x + '" e_y="' + bus.target_pos.y + '">\n';
        this.addPointsBus(bus);
        this.fileString +=
            '       </bus>\n';
    },

    createContour: function (contour) {
        this.fileString +=
            '       <contour type="" idtf="' + this.getIdtf(contour) + '" shapeColor="255" id="' + this.getIdObject(contour) + '" parent="' + this.haveParent(contour) + '" left="0" top="0" right="16.125" bottom="25" textColor="164" text_angle="0" text_font="Times New Roman [Arial]" font_size="10">\n';
        this.addPoints(contour);
        this.fileString +=
            '       </contour>\n';
    },

    createLink: function (node) {
        this.fileString +=
            '       <node type="node/const/general_node" idtf="" shapeColor="0" id="' + this.getIdObject(node) + '" parent="' + this.haveParent(node) + '" left="0" top="0" right="16.125" bottom="25" textColor="164" text_angle="0" text_font="Times New Roman [Arial]" font_size="10" x="' + node.position.x + '" y="' + node.position.y + '" haveBus="' + this.haveBus(node) + '" idtf_pos="0">\n' +
            '           <content type="' + this.getLinkType(node) + '" mime_type="' + this.getLinkMimeType(node) + '" content_visibility="true" file_name=""><![CDATA[' + node.content + ']]></content>\n' +
            '       </node>\n';
    },

    addPoints: function (object) {
        var self = this;
        if (object instanceof SCg.ModelBus) {
            this.addPointsBus(object);
        } else {
            if (object.points.length > 0) {
                this.fileString +=
                    '           <points>\n';
                object.points.forEach(function (point) {
                    self.fileString +=
                        '               <point x="' + point.x + '" y="' + point.y + '"/>\n';
                });
                this.fileString +=
                    '           </points>\n';
            } else {
                this.fileString +=
                    '           <points/>\n';
            }
        }
    },

    addPointsBus: function (object) {
        var self = this;
        if (object.points.length > 1) {
            this.fileString +=
                '           <points>\n';
            for (var point = 0; point < object.points.length - 1; point++) {
                self.fileString +=
                    '               <point x="' + object.points[point].x + '" y="' + object.points[point].y + '"/>\n';
            }
            this.fileString +=
                '           </points>\n';
        } else {
            this.fileString +=
                '           <points/>\n';
        }
    },

    getTypeObject: function (object) {
        for (var key in GwfObjectInfoReader.gwf_type_to_scg_type) {
            if (GwfObjectInfoReader.gwf_type_to_scg_type[key] == object.sc_type) {
                return key
            }
        }
    },

    getIdObject: function (object) {
        if (object instanceof SCg.ModelBus) {
            return this.getIdBus(object);
        } else {
            return object.id + 100;
        }
    },

    getIdBus: function (bus) {
        return bus.id_bus + 100;
    },

    getIdtf: function (object) {
        if (object.text != null) {
            return object.text;
        } else {
            return "";
        }
    },

    getLinkType: function (object) {
        // TODO add work with file(example type="4" mime_type="image/png")
        if (object.contentType == 'string') {
            return "1";
        }
        if (object.contentType == 'html') {    // KBE not support HTML, save as string
            return "1";
        } else {
            return "3";
        }
    },

    getLinkMimeType: function (object) {
        // TODO add work with file(example type="4" mime_type="image/png")
        return "content/term";
    },

    haveBus: function (object) {
        if (object.bus) {
            return "true";
        } else {
            return "false";
        }
    },

    haveParent: function (object) {
        if (object.contour != null) {
            return this.getIdObject(object.contour);
        } else {
            return 0;
        }
    }
};

GwfFileLoader = {

    load: function (args) {


        var reader = new FileReader();

        var is_file_correct;
        reader.onload = function (e) {
            var text = e.target.result;
//            console.log(text);
//            text = text.replace("windows-1251","utf-8");
            is_file_correct = GwfObjectInfoReader.read(text.replace(
                "<?xml version=\"1.0\" encoding=\"windows-1251\"?>",
                "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
            ));

        };

        reader.onloadend = function (e) {
            if (is_file_correct != false) {
                ScgObjectBuilder.buildObjects(GwfObjectInfoReader.objects_info);
                args["render"].update();
            } else
                GwfObjectInfoReader.printErrors();

        };
//        reader.readAsText(args["file"], "CP1251");
        reader.readAsText(args["file"]);
        return true;
    },

    loadFromText: function (text, render) {
        var is_file_correct;
        is_file_correct = GwfObjectInfoReader.read(text.replace(
            "<?xml version=\"1.0\" encoding=\"windows-1251\"?>",
            "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
        ));
        if (is_file_correct != false) {
            ScgObjectBuilder.buildObjects(GwfObjectInfoReader.objects_info);
            render.update();
        } else {
            GwfObjectInfoReader.printErrors();
        }
        return true;
    }

};

var GwfObjectController = {
    x_offset: 0,
    y_offset: 0,

    fixOffsetOfPoints: function (args) {
        var x = parseFloat(args.x);
        var y = parseFloat(args.y);

        if (x < this.x_offset)
            this.x_offset = x;

        if (y < this.y_offset)
            this.y_offset = y;
    },

    getXOffset: function () {
        return Math.abs(this.x_offset) + 60;
    },

    getYOffset: function () {
        return Math.abs(this.y_offset) + 30;
    }
}

var GwfObject = function (args) {

    this.id = -1;
    this.attributes = {};
    this.required_attrs = [];

}

GwfObject.prototype = {
    constructor: GwfObject
}

GwfObject.prototype.parseObject = function (args) {

}

GwfObject.prototype.buildObject = function (args) {

}


GwfObject.prototype.parsePoints = function (args) {

    var gwf_object = args.gwf_object;
    var reader = args.reader;

    var points = gwf_object.getElementsByTagName("points")[0].getElementsByTagName("point");
    this.attributes.points = [];
    for (var i = 0; i < points.length; i++) {
        var point = reader.fetchAttributes(points[i], ["x", "y"]);
        this.attributes.points.push(point);
        GwfObjectController.fixOffsetOfPoints({x: point["x"], y: point["y"]});
    }
}

GwfObject.prototype.fixParent = function (args) {


    var parent = this.attributes["parent"];

    if (parent != "0") {
        var parent_object = args.builder.getOrCreate(parent);
        parent_object.addChild(args.scg_object);
        args.scg_object.update();
        parent_object.update();
    }
}


var GwfObjectNode = function (args) {

    GwfObject.call(this, args);
    this.required_attrs = ["id", "type", "x", "y", "parent", "idtf"];
}

GwfObjectNode.prototype = Object.create(GwfObject.prototype);

// have to specify node and reader
GwfObjectNode.prototype.parseObject = function (args) {
    var node = args.gwf_object;
    var reader = args.reader;

    this.attributes = reader.fetchAttributes(node, this.required_attrs);

    if (this.attributes == false)
        return false;


    //fix some attrs
    this.attributes["type"] = reader.getTypeCode(this.attributes.type);
    this.attributes["x"] = parseFloat(this.attributes["x"]);
    this.attributes["y"] = parseFloat(this.attributes["y"]);

    //fixing points
    GwfObjectController.fixOffsetOfPoints({x: this.attributes["x"], y: this.attributes["y"]});

    this.id = this.attributes["id"];
    return this;
}

// have to specify scene,builder
GwfObjectNode.prototype.buildObject = function (args) {
    var scene = args.scene;
    var builder = args.builder;
    var node = SCg.Creator.createNode(this.attributes["type"], new SCg.Vector3(this.attributes["x"] + GwfObjectController.getXOffset(), this.attributes["y"] + +GwfObjectController.getYOffset(), 0), this.attributes["idtf"]);
    scene.appendNode(node);
    scene.appendSelection(node);
    args.scg_object = node;
    this.fixParent(args);
    node.update();
    return node;
}

///// pairs

var GwfObjectPair = function (args) {
    GwfObject.call(this, args);

    this.required_attrs = ["id", "type", "id_b", "id_e", "dotBBalance", "dotEBalance", "idtf"];
}

GwfObjectPair.prototype = Object.create(GwfObject.prototype);

// have to specify pair and reader
GwfObjectPair.prototype.parseObject = function (args) {
    var pair = args.gwf_object;
    var reader = args.reader;

    this.attributes = reader.fetchAttributes(pair, this.required_attrs);

    if (this.attributes == false)
        return false;

    //fix some attrs

    this.attributes["type"] = reader.getTypeCode(this.attributes.type);
    this.attributes["dotBBalance"] = parseFloat(this.attributes["dotBBalance"])
    this.attributes["dotEBalance"] = parseFloat(this.attributes["dotEBalance"])

    this.id = this.attributes["id"];

    // line points

    this.parsePoints(args);

    return this;

}
GwfObjectPair.prototype.buildObject = function (args) {
    var scene = args.scene;
    var builder = args.builder;
    var source = builder.getOrCreate(this.attributes["id_b"]);
    var target = builder.getOrCreate(this.attributes["id_e"]);
    var edge = SCg.Creator.createEdge(source, target, this.attributes["type"]);
    scene.appendEdge(edge);
    scene.appendSelection(edge);
    edge.source_dot = parseFloat(this.attributes["dotBBalance"]);
    edge.target_dot = parseFloat(this.attributes["dotEBalance"]);
    var edge_points = this.attributes["points"];
    var points = [];
    for (var i = 0; i < edge_points.length; i++) {
        var edge_point = edge_points[i];
        var point = new SCg.Vector2(parseFloat(edge_point.x) + GwfObjectController.getXOffset(), parseFloat(edge_point.y) + GwfObjectController.getYOffset());
        points.push(point);
    }
    edge.setPoints(points);
    source.update();
    target.update();
    edge.update();
    return edge;
}

//contour

var GwfObjectContour = function (args) {
    GwfObject.call(this, args);
    this.required_attrs = ["id", "parent"];
}

GwfObjectContour.prototype = Object.create(GwfObject.prototype);

GwfObjectContour.prototype.parseObject = function (args) {
    var contour = args.gwf_object;
    var reader = args.reader;

    this.attributes = reader.fetchAttributes(contour, this.required_attrs);

    if (this.attributes == false)
        return false;

    this.id = this.attributes['id'];

    //contour points
    this.parsePoints(args);

    return this;
}

GwfObjectContour.prototype.buildObject = function (args) {
    var scene = args.scene;

    var contour_points = this.attributes["points"];

    var verticies = [];

    for (var i = 0; i < contour_points.length; i++) {
        var contour_point = contour_points[i];
        var vertex_x = parseFloat(contour_point.x);

        var vertex_y = parseFloat(contour_point.y);

        var vertex = new SCg.Vector3(vertex_x + GwfObjectController.getXOffset(), vertex_y + GwfObjectController.getYOffset(), 0);
        verticies.push(vertex);
    }

    var contour = SCg.Creator.createCounter(verticies);

    args.scg_object = contour;
    this.fixParent(args);

    scene.appendContour(contour);
    scene.appendSelection(contour);
    contour.update();
    return contour;
}

var GwfObjectBus = function (args) {
    GwfObject.call(this, args);
    this.required_attrs = ["id", "parent", "b_x", "b_y", "e_x", "e_y", "owner", "idtf"];
}

GwfObjectBus.prototype = Object.create(GwfObject.prototype);

GwfObjectBus.prototype.parseObject = function (args) {
    var bus = args.gwf_object;
    var reader = args.reader;

    this.attributes = reader.fetchAttributes(bus, this.required_attrs);

    if (this.attributes == false)
        return false;

    //fix attrs

    this.attributes["e_x"] = parseFloat(this.attributes["e_x"]);
    this.attributes["e_y"] = parseFloat(this.attributes["e_y"]);

    GwfObjectController.fixOffsetOfPoints({x: this.attributes["e_x"], y: this.attributes["e_y"]});

    this.id = this.attributes['id'];

    //bus points
    this.parsePoints(args);

    return this;
}

GwfObjectBus.prototype.buildObject = function (args) {
    var scene = args.scene;
    var builder = args.builder;


    var bus = SCg.Creator.createBus(builder.getOrCreate(this.attributes["owner"]));
    bus.setTargetDot(0);

    var bus_points = this.attributes["points"];
    var points = [];

    for (var i = 0; i < bus_points.length; i++) {
        var bus_point = bus_points[i];
        var point = new SCg.Vector2(parseFloat(bus_point.x) + GwfObjectController.getXOffset(), parseFloat(bus_point.y) + GwfObjectController.getYOffset());
        points.push(point);
    }

    points.push(new SCg.Vector2(this.attributes["e_x"] + GwfObjectController.getXOffset(), this.attributes["e_y"] + GwfObjectController.getYOffset()))

    bus.setPoints(points);

    args.scg_object = bus;
    this.fixParent(args);


    scene.appendBus(bus);
    scene.appendSelection(bus);
    bus.update();
    return bus;
}

var GwfObjectLink = function (args) {
    GwfObject.call(this, args);
    this.content = null;
    this.type = -1;
    this.requiredAttrs = ["id", "x", "y", "parent"];
};

GwfObjectLink.prototype = Object.create(GwfObject.prototype);

GwfObjectLink.prototype.parseObject = function (args) {
    function isHTML(str) {
        return /<[a-z][\s\S]*>/i.test(str);
    }

    function isFloat(value) {
        return !isNaN(value) && value.toString().indexOf('.') != -1;
    }

    var link = args.gwf_object;
    var reader = args.reader;
    this.attributes = reader.fetchAttributes(link, this.requiredAttrs);
    if (this.attributes == false) return false;
    this.attributes["x"] = parseFloat(this.attributes["x"]);
    this.attributes["y"] = parseFloat(this.attributes["y"]);
    GwfObjectController.fixOffsetOfPoints({x: this.attributes["x"], y: this.attributes["y"]});
    this.id = this.attributes["id"];
    var content = link.getElementsByTagName("content")[0];
    this.type = reader.fetchAttributes(content, ["type"])["type"];
    var mime_type = reader.fetchAttributes(content, ["mime_type"])["mime_type"];
    switch (this.type) {
        case '1':
            this.type = 'string';
            break;
        case '3':
            this.type = 'int32';
            break;
        case '4':
            this.type = 'html';
            break;
        default:
            console.log('ERROR PARSE TYPE IN GwfObjectLink');
            break;
    }
    if (this.type != 'html') {
        this.content = content.textContent;
        if (isHTML(this.content)) {
            this.type = 'html';
        } else if (this.type === 'int32' && isFloat(this.content)) {
            this.type = 'float';
        }
    } else {
        this.content = '<img src="data:' + mime_type +
            ';base64,' + content.textContent + ' " alt="Image">';
    }
    return this;
};

GwfObjectLink.prototype.buildObject = function (args) {
    var scene = args.scene;
    var link = SCg.Creator.createLink(new SCg.Vector3(this.attributes["x"] + GwfObjectController.getXOffset(),
            this.attributes["y"] + +GwfObjectController.getYOffset(),
        0),
        '');
    link.setContent(this.content, this.type);
    scene.appendLink(link);
    scene.appendSelection(link);
    args.scg_object = link;
    this.fixParent(args);
    link.update();
    return link;
};


GwfObjectInfoReader = {

    objects_info: {},
    errors: [],

    gwf_type_to_scg_type: {
        "node/-/not_define": sc_type_node,

        "node/const/general_node": sc_type_node | sc_type_const,
        "node/const/asymmetry": sc_type_node | sc_type_const | sc_type_node_tuple,
        "node/const/nopredmet": sc_type_node | sc_type_const | sc_type_node_struct,
        "node/const/attribute": sc_type_node | sc_type_const | sc_type_node_role,
        "node/const/relation": sc_type_node | sc_type_const | sc_type_node_norole,
        "node/const/material": sc_type_node | sc_type_const | sc_type_node_material,
        "node/const/group": sc_type_node | sc_type_const | sc_type_node_class,
        "node/const/predmet": sc_type_node | sc_type_const | sc_type_node_abstract,

        "node/var/general_node": sc_type_node | sc_type_var,
        "node/var/symmetry": sc_type_node | sc_type_var | sc_type_node_tuple,
        "node/var/nopredmet": sc_type_node | sc_type_var | sc_type_node_struct,
        "node/var/attribute": sc_type_node | sc_type_var | sc_type_node_role,
        "node/var/relation": sc_type_node | sc_type_var | sc_type_node_norole,
        "node/var/material": sc_type_node | sc_type_var | sc_type_node_material,
        "node/var/group": sc_type_node | sc_type_var | sc_type_node_class,
        "node/var/predmet": sc_type_node | sc_type_var | sc_type_node_abstract,

        "arc/-/-": sc_type_arc_access,
        "arc/const/fuz/temp": sc_type_arc_access | sc_type_const | sc_type_arc_fuz | sc_type_arc_temp,
        "arc/const/fuz": sc_type_arc_access | sc_type_const | sc_type_arc_fuz | sc_type_arc_perm,
        "arc/const/pos/temp": sc_type_arc_access | sc_type_const | sc_type_arc_pos | sc_type_arc_temp,
        "arc/const/pos": sc_type_arc_access | sc_type_const | sc_type_arc_pos | sc_type_arc_perm,
        "arc/const/neg/temp": sc_type_arc_access | sc_type_const | sc_type_arc_neg | sc_type_arc_temp,
        "arc/const/neg": sc_type_arc_access | sc_type_const | sc_type_arc_neg | sc_type_arc_perm,
        "pair/const/orient": sc_type_arc_common | sc_type_const,
        "pair/const/synonym": sc_type_edge_common | sc_type_const,
        "pair/orient": sc_type_arc_common,

        "pair/var/orient": sc_type_arc_common | sc_type_var,
        "arc/var/fuz/temp": sc_type_arc_access | sc_type_var | sc_type_arc_fuz | sc_type_arc_temp,
        "arc/var/fuz": sc_type_arc_access | sc_type_var | sc_type_arc_fuz | sc_type_arc_perm,
        "arc/var/pos/temp": sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_temp,
        "arc/var/pos": sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm,
        "arc/var/neg/temp": sc_type_arc_access | sc_type_var | sc_type_arc_neg | sc_type_arc_temp,
        "arc/var/neg": sc_type_arc_access | sc_type_var | sc_type_arc_neg | sc_type_arc_perm,
        "pair/var/noorient": sc_type_edge_common | sc_type_var,
        "pair/var/synonym": sc_type_edge_common | sc_type_var,
        "pair/noorient": sc_type_edge_common
    },

    read: function (strs) {
        this.objects_info = {};
        var xml_doc = (new DOMParser()).parseFromString(strs, "text/xml");

        var root = xml_doc.documentElement;

        if (root.nodeName == "html") {
            alert(root.getElementsByTagName("div")[0].innerHTML);
            return false;
        } else if (root.nodeName != "GWF") {
            alert("Given document has unsupported format " + root.nodeName);
            return false;
        }

        var static_sector = this.parseGroupOfElements(root, "staticSector", true);

        if (static_sector == false)
            return false;


        static_sector = static_sector[0];

        //contours

        var contours = this.parseGroupOfElements(static_sector, "contour", false);
        this.forEach(contours, this.parseContour);

        //nodes
        var nodes = this.parseGroupOfElements(static_sector, "node", false);
        this.forEach(nodes, this.parseNode);

        //buses
        var buses = this.parseGroupOfElements(static_sector, "bus", false);
        this.forEach(buses, this.parseBus);

        //arcs
        var arcs = this.parseGroupOfElements(static_sector, "arc", false);
        this.forEach(arcs, this.parsePair);

        //pairs
        var arcs = this.parseGroupOfElements(static_sector, "pair", false);
        this.forEach(arcs, this.parsePair);

        if (this.errors.length == 0)
            return true;
        else
            return false;

    },

    printErrors: function () {
        for (var i = 0; i < this.errors.length; i++)
            console.log(this.errors[i]);
    },

    parseGroupOfElements: function (parent, tag_name, is_required) {
        var elements = parent.getElementsByTagName(tag_name);
        if (elements.length == 0 && is_required == true) {
            this.errors.push("Unnable to find " + tag_name + " tag");
            return false;
        }
        return elements;
    },

    parseContour: function (contour) {
        var parsed_contour = new GwfObjectContour(null);

        var result = parsed_contour.parseObject({gwf_object: contour, reader: this});

        if (result == false)
            return false;

        this.objects_info[parsed_contour.id] = parsed_contour;

    },

    parsePair: function (pair) {
        var parsed_pair = new GwfObjectPair(null);

        var result = parsed_pair.parseObject({gwf_object: pair, reader: this});

        if (result == false)
            return false;

        this.objects_info[parsed_pair.id] = parsed_pair;

    },

    parseNode: function (node) {
        var content = node.getElementsByTagName("content");
        var parsed_node;
        if (content[0].textContent == "") {
            parsed_node = new GwfObjectNode(null);
        } else {
            parsed_node = new GwfObjectLink(null);
        }
        if (parsed_node.parseObject({gwf_object: node, reader: this}) == false)
            return false;
        this.objects_info[parsed_node.id] = parsed_node;

    },

    parseBus: function (bus) {
        var parsed_bus = new GwfObjectBus(null);

        if (parsed_bus.parseObject({gwf_object: bus, reader: this}) == false)
            return false;
        this.objects_info[parsed_bus.id] = parsed_bus;
    },

    fetchAttributes: function (tag_element, required_attrs) {
        var tag_attributes = tag_element.attributes;
        var result_dict = {};

        for (var i = 0; i < required_attrs.length; i++) {
            var attribute = required_attrs[i];
            var found_attr = tag_attributes[attribute];
            if (found_attr != null) {
                result_dict[found_attr.name] = found_attr.value;
            } else {
                this.errors.push("Unnable to find " + attribute + " attribute.");
                return false;
            }
        }

        return result_dict;
    },

    forEach: function (array, fun) {
        for (var i = 0; i < array.length; i++)
            if (fun.call(this, array[i]) == false)
                return false;
    },

    getAttr: function (tag, attr_name) {
        return tag.getAttribute(attr_name);
    },

    getFloatAttr: function (tag, attr_name) {
        return parseFloat(this.getAttr(tag, attr_name));
    },
    getStrAttr: function (tag, attr_name) {

    },

    getTypeCode: function (gfw_type) {
        return this.gwf_type_to_scg_type[gfw_type];
    }
}

ScgObjectBuilder = {
    scg_objects: {},
    gwf_objects: {},
    commandList: [],
    commandSetAddrList: [],
    scene: null,

    buildObjects: function (gwf_objects) {
        this.gwf_objects = gwf_objects;
        for (var gwf_object_id  in gwf_objects) {
            var gwf_object = gwf_objects[gwf_object_id];
            if (gwf_object.attributes.id in this.scg_objects == false) {
                var scg_object = gwf_object.buildObject({
                    scene: this.scene,
                    builder: this
                });
                this.scg_objects[gwf_object.attributes.id] = scg_object;
                this.commandList.push(new SCgCommandAppendObject(scg_object, this.scene));
            }
        }
        this.scene.commandManager.execute(new SCgWrapperCommand(this.commandList), true);
        this.getScAddrsForObjects();
        this.emptyObjects();
    },

    getOrCreate: function (gwf_object_id) {
        if (gwf_object_id in this.scg_objects == false) {
            var gwf_object = this.gwf_objects[gwf_object_id];
            this.scg_objects[gwf_object_id] = gwf_object.buildObject({
                scene: this.scene,
                builder: this
            });
            this.commandList.push(new SCgCommandAppendObject(this.scg_objects[gwf_object_id], this.scene));
        }
        return this.scg_objects[gwf_object_id];
    },

    getScAddrsForObjects: function () {
        var self = this;
        var nodes = this.getAllNodesFromObjects();
        var promises = this.trySetScAddrForNodes(nodes);
        Promise.all(promises).then(function () {
            self.scene.commandManager.execute(new SCgWrapperCommand(self.commandSetAddrList));
            self.commandSetAddrList = [];
        });
    },

    getAllNodesFromObjects: function () {
        var self = this;
        var nodes = [];
        Object.keys(this.scg_objects).forEach(function (gwf_object_id) {
            var node = self.scg_objects[gwf_object_id];
            if (node instanceof SCg.ModelNode) {
                nodes.push(node);
            }
        });
        return nodes;
    },

    trySetScAddrForNodes: function (nodes) {
        var self = this;
        var edit = this.scene.edit;
        var promises = [];
        nodes.forEach(node => {
            promises.push(new Promise((resolve) => {
                const idtf = node.text;
                if (idtf?.length) {
                    edit.autocompletionVariants(idtf, (keys) => {
                        keys.some((string) => {
                            if (idtf === string) {
                                searchNodeByAnyIdentifier(idtf).then((foundAddr) => {
                                    self.commandSetAddrList.push(new SCgCommandGetNodeFromMemory(
                                        node,
                                        node.sc_type,
                                        idtf,
                                        foundAddr.value,
                                        self.scene)
                                    );
                                });
                                return true;
                            }
                            return false
                        });
                    });
                }
                resolve(node);
            }));
        });
        return promises;
    },

    emptyObjects: function () {
        this.gwf_objects = {};
        this.scg_objects = {};
        this.commandList = [];
    }
};
var SCg = SCg || {
    version: "0.1.0"
};

SCg.Editor = function () {

    this.render = null;
    this.scene = null;
};

SCg.Editor.prototype = {


    init: function (params) {
        this.typesMap = {
            'scg-type-node': sc_type_node,
            'scg-type-node-const': sc_type_node | sc_type_const,
            'scg-type-node-const-group': sc_type_node | sc_type_const | sc_type_node_class,
            'scg-type-node-const-abstract': sc_type_node | sc_type_const | sc_type_node_abstract,
            'scg-type-node-const-material': sc_type_node | sc_type_const | sc_type_node_material,
            'scg-type-node-const-norole': sc_type_node | sc_type_const | sc_type_node_norole,
            'scg-type-node-const-role': sc_type_node | sc_type_const | sc_type_node_role,
            'scg-type-node-const-struct': sc_type_node | sc_type_const | sc_type_node_struct,
            'scg-type-node-const-tuple': sc_type_node | sc_type_const | sc_type_node_tuple,
            'scg-type-node-var': sc_type_node | sc_type_var,
            'scg-type-node-var-group': sc_type_node | sc_type_var | sc_type_node_class,
            'scg-type-node-var-abstract': sc_type_node | sc_type_var | sc_type_node_abstract,
            'scg-type-node-var-material': sc_type_node | sc_type_var | sc_type_node_material,
            'scg-type-node-var-norole': sc_type_node | sc_type_var | sc_type_node_norole,
            'scg-type-node-var-role': sc_type_node | sc_type_var | sc_type_node_role,
            'scg-type-node-var-struct': sc_type_node | sc_type_var | sc_type_node_struct,
            'scg-type-node-var-tuple': sc_type_node | sc_type_var | sc_type_node_tuple,
            'scg-type-edge-common': sc_type_edge_common,
            'scg-type-arc-common': sc_type_arc_common,
            'scg-type-arc-common-access': sc_type_arc_access,
            'scg-type-edge-const': sc_type_edge_common | sc_type_const,
            'scg-type-arc-const': sc_type_arc_common | sc_type_const,
            'scg-type-arc-const-perm-pos-access': sc_type_arc_access | sc_type_const | sc_type_arc_pos |
            sc_type_arc_perm,
            'scg-type-arc-const-perm-neg-access': sc_type_arc_access | sc_type_const | sc_type_arc_neg |
            sc_type_arc_perm,
            'scg-type-arc-const-perm-fuz-access': sc_type_arc_access | sc_type_const | sc_type_arc_fuz |
            sc_type_arc_perm,
            'scg-type-arc-const-temp-pos-access': sc_type_arc_access | sc_type_const | sc_type_arc_pos |
            sc_type_arc_temp,
            'scg-type-arc-const-temp-neg-access': sc_type_arc_access | sc_type_const | sc_type_arc_neg |
            sc_type_arc_temp,
            'scg-type-arc-const-temp-fuz-access': sc_type_arc_access | sc_type_const | sc_type_arc_fuz |
            sc_type_arc_temp,
            'scg-type-edge-var': sc_type_edge_common | sc_type_var,
            'scg-type-arc-var': sc_type_arc_common | sc_type_var,
            'scg-type-arc-var-perm-pos-access': sc_type_arc_access | sc_type_var | sc_type_arc_pos |
            sc_type_arc_perm,
            'scg-type-arc-var-perm-neg-access': sc_type_arc_access | sc_type_var | sc_type_arc_neg |
            sc_type_arc_perm,
            'scg-type-arc-var-perm-fuz-access': sc_type_arc_access | sc_type_var | sc_type_arc_fuz |
            sc_type_arc_perm,
            'scg-type-arc-var-temp-pos-access': sc_type_arc_access | sc_type_var | sc_type_arc_pos |
            sc_type_arc_temp,
            'scg-type-arc-var-temp-neg-access': sc_type_arc_access | sc_type_var | sc_type_arc_neg |
            sc_type_arc_temp,
            'scg-type-arc-var-temp-fuz-access': sc_type_arc_access | sc_type_var | sc_type_arc_fuz |
            sc_type_arc_temp
        };

        this.render = new SCg.Render();
        this.scene = new SCg.Scene({
            render: this.render,
            edit: this
        });
        this.scene.init();

        this.render.scene = this.scene;
        this.render.init(params);

        this.containerId = params.containerId;

        if (params.autocompletionVariants)
            this.autocompletionVariants = params.autocompletionVariants;
        if (params.translateToSc)
            this.translateToSc = params.translateToSc;
        if (params.resolveControls)
            this.resolveControls = params.resolveControls;

        this.canEdit = !!params.canEdit;
        this.initUI();

    },

    /**
     * Initialize user interface
     */
    initUI: function () {
        var self = this;
        var container = '#' + this.containerId;
        $(container).prepend('<div id="tools-' + this.containerId + '"></div>');
        var tools_container = '#tools-' + this.containerId;
        $(tools_container).load('static/components/html/scg-tools-panel.html', function () {
            $.ajax({
                url: "static/components/html/scg-types-panel-nodes.html",
                dataType: 'html',
                success: function (response) {
                    self.node_types_panel_content = response;
                },
                error: function () {
                    SCgDebug.error("Error to get nodes type change panel");
                },
                complete: function () {
                    $.ajax({
                        url: "static/components/html/scg-types-panel-edges.html",
                        dataType: 'html',
                        success: function (response) {
                            self.edge_types_panel_content = response;
                        },
                        error: function () {
                            SCgDebug.error(
                                "Error to get edges type change panel");
                        },
                        complete: function () {
                            self.bindToolEvents();
                        }
                    });
                }
            });
            if (!self.canEdit) {
                self.hideTool(self.toolEdge());
                self.hideTool(self.toolBus());
                self.hideTool(self.toolContour());
                self.hideTool(self.toolOpen());
                self.hideTool(self.toolSave());
                self.hideTool(self.toolIntegrate());
                self.hideTool(self.toolUndo());
                self.hideTool(self.toolRedo());
            }
            if (self.resolveControls)
                self.resolveControls(tools_container);
        });
        this.scene.event_selection_changed = function () {
            self.onSelectionChanged();
        };
        this.scene.event_modal_changed = function () {
            self.onModalChanged();
        };
        this.keyboardCallbacks = {
            'onkeydown': function (event) {
                self.scene.onKeyDown(event)
            },
            'onkeyup': function (event) {
                self.scene.onKeyUp(event);
            }
        };
        this.openComponentCallbacks = function () {
            self.render.requestUpdateAll();
        }
    },

    hideTool: function (tool) {
        tool.addClass('hidden');
    },

    showTool: function (tool) {
        tool.removeClass('hidden');
    },

    toggleTool: function (tool) {
        tool.toggleClass('hidden');
    },

    tool: function (name) {
        return $('#' + this.containerId).find('#scg-tool-' + name);
    },

    toolSwitch: function () {
        return this.tool('switch');
    },

    toolSelect: function () {
        return this.tool('select');
    },

    toolEdge: function () {
        return this.tool('edge');
    },

    toolBus: function () {
        return this.tool('bus');
    },

    toolContour: function () {
        return this.tool('contour');
    },

    toolLink: function () {
        return this.tool('link');
    },

    toolUndo: function () {
        return this.tool('undo');
    },

    toolRedo: function () {
        return this.tool('redo');
    },

    toolChangeIdtf: function () {
        return this.tool('change-idtf');
    },

    toolChangeType: function () {
        return this.tool('change-type');
    },

    toolSetContent: function () {
        return this.tool('set-content');
    },

    toolDelete: function () {
        return this.tool('delete');
    },

    toolClear: function () {
        return this.tool('clear');
    },

    toolIntegrate: function () {
        return this.tool('integrate');
    },

    toolOpen: function () {
        return this.tool('open');
    },

    toolSave: function () {
        return this.tool('save');
    },

    toolZoomIn: function () {
        return this.tool('zoomin');
    },

    toolZoomOut: function () {
        return this.tool('zoomout');
    },

    /**
     * Bind events to panel tools
     */
    bindToolEvents: function () {

        var self = this;
        var container = '#' + this.containerId;
        var cont = $(container);

        var select = this.toolSelect();
        select.button('toggle');

        // handle clicks on mode change
        this.toolSwitch().click(function () {
            self.canEdit = !self.canEdit;
            var tools = [self.toolEdge(),
                self.toolContour(),
                self.toolBus(),
                self.toolUndo(),
                self.toolRedo(),
                self.toolDelete(),
                self.toolClear(),
                self.toolOpen(),
                self.toolSave(),
                self.toolIntegrate()
            ];
            for (var button = 0; button < tools.length; button++) {
                self.toggleTool(tools[button]);
            }
            self.hideTool(self.toolChangeIdtf());
            self.hideTool(self.toolSetContent());
            self.hideTool(self.toolChangeType());
            self.hideTool(self.toolDelete());
        });
        select.click(function () {
            self.scene.setEditMode(SCgEditMode.SCgModeSelect);
        });
        select.dblclick(function () {
            self.scene.setModal(SCgModalMode.SCgModalType);
            self.onModalChanged();
            var tool = $(this);

            function stop_modal() {
                tool.popover('destroy');
                self.scene.setEditMode(SCgEditMode.SCgModeSelect);
                self.scene.setModal(SCgModalMode.SCgModalNone);
            }

            el = $(this);
            el.popover({
                content: self.node_types_panel_content,
                container: container,
                title: 'Change type',
                html: true,
                delay: {
                    show: 500,
                    hide: 100
                }
            }).popover('show');
            cont.find('.popover-title').append(
                '<button id="scg-type-close" type="button" class="close">&times;</button>');
            $(container + ' #scg-type-close').click(function () {
                stop_modal();
            });
            $(container + ' .popover .btn').click(function () {
                SCgTypeNodeNow = self.typesMap[$(this).attr('id')];
                stop_modal();
            });
        });
        this.toolEdge().click(function () {
            self.scene.setEditMode(SCgEditMode.SCgModeEdge);
        });
        this.toolEdge().dblclick(function () {
            self.scene.setModal(SCgModalMode.SCgModalType);
            self.onModalChanged();
            var tool = $(this);

            function stop_modal() {
                tool.popover('destroy');
                self.scene.setEditMode(SCgEditMode.SCgModeEdge);
                self.scene.setModal(SCgModalMode.SCgModalNone);
            }

            el = $(this);
            el.popover({
                content: self.edge_types_panel_content,
                container: container,
                title: 'Change type',
                html: true,
                delay: {
                    show: 500,
                    hide: 100
                }
            }).popover('show');
            cont.find('.popover-title').append(
                '<button id="scg-type-close" type="button" class="close">&times;</button>');
            $(container + ' #scg-type-close').click(function () {
                stop_modal();
            });
            $(container + ' .popover .btn').click(function () {
                SCgTypeEdgeNow = self.typesMap[$(this).attr('id')];
                stop_modal();
            });
        });
        this.toolBus().click(function () {
            self.scene.setEditMode(SCgEditMode.SCgModeBus);
        });
        this.toolContour().click(function () {
            self.scene.setEditMode(SCgEditMode.SCgModeContour);
        });
        this.toolLink().click(function () {
            self.scene.setEditMode(SCgEditMode.SCgModeLink);
        });
        this.toolUndo().click(function () {
            self.scene.commandManager.undo();
            self.scene.updateRender();
        });
        this.toolRedo().click(function () {
            self.scene.commandManager.redo();
            self.scene.updateRender();
        });
        this.toolChangeIdtf().click(function () {
            self.scene.setModal(SCgModalMode.SCgModalIdtf);
            $(this).popover({
                container: container
            });
            $(this).popover('show');

            var tool = $(this);

            function stop_modal() {
                self.scene.setModal(SCgModalMode.SCgModalNone);
                tool.popover('destroy');
                self.scene.updateObjectsVisual();
            }

            var input = $(container + ' #scg-change-idtf-input');
            // setup initial value
            input.val(self.scene.selected_objects[0].text);

            // Fix for chrome: http://stackoverflow.com/questions/17384464/jquery-focus-not-working-in-chrome
            setTimeout(function () {
                input.focus();
            }, 1);
            input.keypress(function (e) {
                if (e.keyCode == KeyCode.Enter || e.keyCode == KeyCode.Escape) {

                    if (e.keyCode == KeyCode.Enter) {
                        var obj = self.scene.selected_objects[0];
                        if (obj.text != input.val()) {
                            self.scene.commandManager.execute(new SCgCommandChangeIdtf(obj,
                                input.val()));
                        }
                    }
                    stop_modal();
                    e.preventDefault();
                }

            });

            if (self.autocompletionVariants) {
                var types = {
                    local: function (text) {
                        return "[" + text + "]";
                    },
                    remote: function (text) {
                        return "<" + text + ">";
                    }

                };

                input.typeahead({
                    minLength: 1,
                    highlight: true
                }, {
                    name: 'idtf',
                    source: function (str, callback) {
                        self._selectedIdtf = null;
                        self.autocompletionVariants(str, callback);
                    },
                    templates: {
                        suggestion: (string) => {
                            return string;
                        }
                    }
                }).bind('typeahead:selected', (event, string, data) => {
                    if (string?.length) {
                        self._selectedIdtf = string;
                    }
                    event.stopPropagation();
                    input.val(string);
                    $('.typeahead').val('');
                });
            }

            // process controls
            $(container + ' #scg-change-idtf-apply').click(async function () {
                var obj = self.scene.selected_objects[0];
                if (obj.text != input.val() && !self._selectedIdtf) {
                    self.scene.commandManager.execute(new SCgCommandChangeIdtf(obj, self._selectedIdtf));
                }
                if (self._selectedIdtf) {
                    searchNodeByAnyIdentifier(self._selectedIdtf).then(async (selectedAddr) => {
                        if (!selectedAddr)
                            stop_modal();

                        const [type] = await scClient.checkElements([selectedAddr]);
                        self.scene.commandManager.execute(new SCgCommandGetNodeFromMemory(
                            obj,
                            type.value,
                            self._selectedIdtf,
                            selectedAddr.value,
                            self.scene));
                        stop_modal();
                    });
                } else
                    stop_modal();
            });
            $(container + ' #scg-change-idtf-cancel').click(function () {
                stop_modal();
            });

        });

        this.toolChangeType().click(function () {
            self.scene.setModal(SCgModalMode.SCgModalType);

            var tool = $(this);

            function stop_modal() {
                self.scene.setModal(SCgModalMode.SCgModalNone);
                tool.popover('destroy');
                self.scene.event_selection_changed();
                self.scene.updateObjectsVisual();
            }

            var obj = self.scene.selected_objects[0];

            el = $(this);
            el.popover({
                content: (obj instanceof SCg.ModelEdge) ? self.edge_types_panel_content : self.node_types_panel_content,
                container: container,
                title: 'Change type',
                html: true,
                delay: {
                    show: 500,
                    hide: 100
                }
            }).popover('show');

            cont.find('.popover-title').append(
                '<button id="scg-type-close" type="button" class="close">&times;</button>');

            $(container + ' #scg-type-close').click(function () {
                stop_modal();
            });

            $(container + ' .popover .btn').click(function () {
                var newType = self.typesMap[$(this).attr('id')];
                var command = [];
                self.scene.selected_objects.forEach(function (obj) {
                    if (obj.sc_type !== newType) {
                        command.push(new SCgCommandChangeType(obj, newType));
                    }
                });
                self.scene.commandManager.execute(new SCgWrapperCommand(command));
                self.scene.updateObjectsVisual();
                stop_modal();
            });
        });


        this.toolSetContent().click(function () {
            var tool = $(this);

            function stop_modal() {
                self.scene.setModal(SCgModalMode.SCgModalNone);
                tool.popover('destroy');
                self.scene.updateObjectsVisual();
            }

            self.scene.setModal(SCgModalMode.SCgModalIdtf);
            $(this).popover({
                container: container
            });
            $(this).popover('show');

            var input = $(container + ' #scg-set-content-input');
            var input_content = $(container + " input#content[type='file']");
            var input_content_type = $(container + " #scg-set-content-type");
            input.val(self.scene.selected_objects[0].content);
            input_content_type.val(self.scene.selected_objects[0].contentType);
            setTimeout(function () {
                input.focus();
            }, 1);
            input.keypress(function (e) {
                if (e.keyCode == KeyCode.Enter || e.keyCode == KeyCode.Escape) {
                    if (e.keyCode == KeyCode.Enter) {
                        var obj = self.scene.selected_objects[0];
                        if (obj.content != input.val() || obj.contentType != input_content_type
                                .val()) {
                            self.scene.commandManager.execute(new SCgCommandChangeContent(obj,
                                input.val(),
                                input_content_type.val()));
                        }
                    }
                    stop_modal();
                    e.preventDefault();
                }
            });
            // process controls
            $(container + ' #scg-set-content-apply').click(function () {
                var obj = self.scene.selected_objects[0];
                var file = input_content[0].files[0];
                if (file != undefined) {
                    var fileReader = new FileReader();
                    fileReader.onload = function () {
                        var scLinkHelper = new ScFileLinkHelper(file, this.result);
                        if (obj.fileReaderResult != scLinkHelper.fileArrayBuffer || obj.contentType !=
                            scLinkHelper.type) {
                            self.scene.commandManager.execute(new SCgCommandChangeContent(
                                obj,
                                scLinkHelper.htmlViewResult(),
                                scLinkHelper.type,
                                scLinkHelper.fileArrayBuffer
                            ));
                        }
                        stop_modal();
                    };
                    fileReader.readAsArrayBuffer(file);
                } else {
                    if (obj.content != input.val() || obj.contentType != input_content_type.val()) {
                        self.scene.commandManager.execute(new SCgCommandChangeContent(obj,
                            input.val(),
                            input_content_type.val(),
                            null
                        ));
                    }
                    stop_modal();
                }
            });
            $(container + ' #scg-set-content-cancel').click(function () {
                stop_modal();
            });
        });

        this.toolDelete().click(function () {
            if (self.scene.selected_objects.length > 0) {
                self.scene.deleteObjects(self.scene.selected_objects.slice(0, self.scene.selected_objects
                    .length));
                self.scene.clearSelection();
            }
        });

        this.toolClear().click(function () {
            self.scene.selectAll();
            self.toolDelete().click();
        });

        this.toolOpen().click(function () {
            var document = $(this)[0].ownerDocument;
            var open_dialog = document.getElementById("scg-tool-open-dialog");
            self.scene.clearSelection();
            open_dialog.onchange = function () {
                return GwfFileLoader.load({
                    file: open_dialog.files[0],
                    render: self.render
                });

            }
            ScgObjectBuilder.scene = self.scene;
            var result = open_dialog.click();
        });

        this.toolSave().click(function () {
            var blob = new Blob([GwfFileCreate.createFile(self.scene)], {
                type: "text/plain;charset=utf-8"
            });
            saveAs(blob, "new_file.gwf");
        });

        this.toolIntegrate().click(function () {
            self._disableTool(self.toolIntegrate());
            if (self.translateToSc)
                self.translateToSc(self.scene, function () {
                    self._enableTool(self.toolIntegrate());
                });
        });

        this.toolZoomIn().click(function () {
            self.render.changeScale(1.1);
        });

        this.toolZoomOut().click(function () {
            self.render.changeScale(0.9);
        });


        // initial update
        self.onModalChanged();
        self.onSelectionChanged();
    },

    /**
     * Function that process selection changes in scene
     * It updated UI to current selection
     */
    onSelectionChanged: function () {
        if (this.canEdit) {
            this.hideTool(this.toolChangeIdtf());
            this.hideTool(this.toolSetContent());
            this.hideTool(this.toolChangeType());
            this.hideTool(this.toolDelete());
            if (this.scene.selected_objects.length > 1) {
                if (this.scene.isSelectedObjectAllArcsOrAllNodes() && !this.scene.isSelectedObjectAllHaveScAddr()) {
                    this.showTool(this.toolChangeType());
                }
            } else if (this.scene.selected_objects.length == 1 && !this.scene.selected_objects[0].sc_addr) {
                if (this.scene.selected_objects[0] instanceof SCg.ModelNode) {
                    this.showTool(this.toolChangeIdtf());
                    this.showTool(this.toolChangeType());
                } else if (this.scene.selected_objects[0] instanceof SCg.ModelEdge) {
                    this.showTool(this.toolChangeType());
                } else if (this.scene.selected_objects[0] instanceof SCg.ModelContour) {
                    this.showTool(this.toolChangeIdtf());
                } else if (this.scene.selected_objects[0] instanceof SCg.ModelLink) {
                    this.showTool(this.toolSetContent());
                }
            }
            if (this.scene.selected_objects.length > 0) this.showTool(this.toolDelete());
        }
    },


    /**
     * Function, that process modal state changes of scene
     */
    onModalChanged: function () {
        var self = this;

        function update_tool(tool) {
            if (self.scene.modal != SCgModalMode.SCgModalNone)
                self._disableTool(tool);
            else
                self._enableTool(tool);
        }

        update_tool(this.toolSwitch());
        update_tool(this.toolSelect());
        update_tool(this.toolEdge());
        update_tool(this.toolBus());
        update_tool(this.toolContour());
        update_tool(this.toolLink());
        update_tool(this.toolUndo());
        update_tool(this.toolRedo());
        update_tool(this.toolChangeIdtf());
        update_tool(this.toolChangeType());
        update_tool(this.toolSetContent());
        update_tool(this.toolDelete());
        update_tool(this.toolClear());
        update_tool(this.toolZoomIn());
        update_tool(this.toolZoomOut());
        update_tool(this.toolIntegrate());
        update_tool(this.toolOpen());
    },

    collectIdtfs: function (keyword) {
        var self = this;
        var selected_obj = self.scene.selected_objects[0];
        var relative_objs = undefined;

        if (selected_obj instanceof SCg.ModelNode) {
            relative_objs = self.scene.nodes;
        }
        if (!relative_objs)
            return [];

        var match = function (text) {
            var pattern = new RegExp(keyword, 'i');
            if (text && pattern.test(text))
                return true;
            return false;
        }

        var contains = function (value, array) {
            var len = array.length;
            while (len--) {
                if (array[len].name === value.name)
                    return true
            }
            return false;
        }
        var matches = [];
        $.each(relative_objs, function (index, item) {
            if (match(item['text'])) {
                var obj = {
                    name: item['text'],
                    type: 'local'
                }
                if (!contains(obj, matches))
                    matches.push(obj);
            }

        });
        return matches;
    },

    /**
     * function(keyword, callback, args)
     * here is default implementation
     * */

    autocompletionVariants: function (keyword, callback, args) {
        var self = this;
        callback(self.collectIdtfs(keyword));
    },

    // -------------------------------- Helpers ------------------
    /**
     * Change specified tool state to disabled
     */
    _disableTool: function (tool) {
        tool.attr('disabled', 'disabled');
    },

    /**
     * Change specified tool state to enabled
     */
    _enableTool: function (tool) {
        tool.removeAttr('disabled');
    }
};
var SCgDebug = {

    enabled: true,

    error: function (message) {
        if (!this.enabled) return; // do nothing

        throw message;
    }

}

SCg.Vector2 = function (x, y) {
    this.x = x;
    this.y = y;
};

SCg.Vector2.prototype = {
    constructor: SCg.Vector2,

    copyFrom: function (other) {
        this.x = other.x;
        this.y = other.y;

        return this;
    },

    clone: function () {
        return new SCg.Vector2(this.x, this.y);
    },

    add: function (other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    },

    sub: function (other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    },

    mul: function (other) {
        this.x *= other.x;
        this.y *= other.y;
        return this;
    },

    div: function (other) {
        this.x /= other.x;
        this.y /= other.y;
        return this;
    },

    multiplyScalar: function (v) {
        this.x *= v;
        this.y *= v;
        return this;
    },

    divideScalar: function (v) {
        this.x /= v;
        this.y /= v;
        return this;
    },

    length: function () {
        return Math.sqrt(this.lengthSquared());
    },

    lengthSquared: function () {
        return this.x * this.x + this.y * this.y;
    },

    distance: function () {
        return Math.sqrt(this.distanceSquared.apply(this, arguments));
    },

    distanceSquared: function () {
        if (arguments.length === 2) {
            var x = this.x - arguments[0],
                y = this.y - arguments[1];

            return x * x + y * y;
        }

        var x = this.x - arguments[0].x,
            y = this.y - arguments[0].y;
        return x * x + y * y;
    },

    normalize: function () {
        return this.divideScalar(this.length());
    },

    dotProduct: function (other) {
        return this.x * other.x + this.y * other.y;
    },

    crossProduct: function (other) {
        return this.x * other.y - this.y * other.x;
    }
};


// --------------------
SCg.Vector3 = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

SCg.Vector3.prototype = {
    constructor: SCg.Vector3,

    equals: function (other) {
        return this.x == other.x && this.y == other.y && this.z == other.z;
    },

    copyFrom: function (other) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;

        return this;
    },

    clone: function () {
        return new SCg.Vector3(this.x, this.y, this.z);
    },

    sub: function (other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;

        return this;
    },

    add: function (other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;

        return this;
    },

    mul: function (other) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;

        return this;
    },

    div: function (other) {
        this.x /= other.x;
        this.y /= other.y;
        this.z /= other.z;

        return this;
    },

    multiplyScalar: function (v) {
        this.x *= v;
        this.y *= v;
        this.z *= v;

        return this;
    },

    normalize: function () {
        var l = this.length();
        this.x /= l;
        this.y /= l;
        this.z /= l;
    },

    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    },

    lengthSquared: function () {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    },

    dotProduct: function (other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    },

    crossProduct: function (other) {
        return new SCg.Vector3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x);
    },

    to2d: function () {
        return new SCg.Vector2(this.x, this.y);
    }
};

SCg.Math = {};

SCg.Math.distanceSquared = function (p1, p2) {
    var x = p1.x - p2.x,
        y = p1.y - p2.y;

    return x * x + y * y;
};


SCg.Algorithms = {};

/*!
 * Check if a point is in polygon
 * http://habrahabr.ru/post/125356/
 * @param point object with 'x' and 'y' fields, {SCg.Vector2} for example
 * @param vertecies Array of points, which represents a polygon
 * @return {boolean} true if the point is in the polygon, false otherwise
 */
SCg.Algorithms.isPointInPolygon = function (point, vertecies) {
    // create copy of array of vertecies
    var polygon = $.map(vertecies, function (vertex) {
        return $.extend({}, vertex);
    });

    var Q_PATT = [[0, 1], [3, 2]];

    var pred_pt = polygon[polygon.length - 1];
    var t1 = pred_pt.y - point.y < 0 ? 1 : 0;
    var t2 = pred_pt.x - point.x < 0 ? 1 : 0;
    var pred_q = Q_PATT[t1][t2];

    var w = 0;

    for (var i = 0; i < polygon.length; i++) {
        var cur_pt = polygon[i];
        cur_pt.x -= point.x;
        cur_pt.y -= point.y;

        t1 = cur_pt.y < 0 ? 1 : 0;
        t2 = cur_pt.x < 0 ? 1 : 0;
        var q = Q_PATT[t1][t2];

        switch (q - pred_q) {
            case -3:
                ++w;
                break;
            case 3:
                --w;
                break;
            case -2:
                if (pred_pt.x * cur_pt.y >= pred_pt.y * cur_pt.x)
                    ++w;
                break;
            case 2:
                if (!(pred_pt.x * cur_pt.y >= pred_pt.y * cur_pt.x))
                    --w;
                break;
        }

        pred_pt = cur_pt;
        pred_q = q;
    }

    return w != 0;
};

/*!
 * Find intersection points of line and polygon
 * @param pin Array of points, which represents a polygon
 * @param segStart the first point, object with 'x' and 'y' fields, {SCg.Vector2} for example
 * @param segEnd the second point, object with 'x' and 'y' fields, {SCg.Vector2} for example
 * @return {Array} intersection points
 */
SCg.Algorithms.polyclip = function (pin, segStart, segEnd) {

    var inside = function (p, plane) {
        var d = p.x * plane[0] + p.y * plane[1];
        return d > plane[2];
    };

    var clip = function (segStart, segEnd, plane) {
        var d1 = segStart.x * plane[0] + segStart.y * plane[1] - plane[2];
        var d2 = segEnd.x * plane[0] + segEnd.y * plane[1] - plane[2];
        var t = (0 - d1) / (d2 - d1);
        var x1 = segStart.x + t * (segEnd.x - segStart.x);
        var y1 = segStart.y + t * (segEnd.y - segStart.y);
        return {x: x1, y: y1};
    };

    var plane = [segStart.y - segEnd.y, segEnd.x - segStart.x, 0];
    plane[2] = segStart.x * plane[0] + segStart.y * plane[1];
    var n = pin.length;
    var pout = [];
    var s = pin[n - 1];
    for (var ci = 0; ci < n; ci++) {
        var p = pin[ci];
        if (inside(p, plane)) {
            if (!inside(s, plane)) {
                var t = clip(s, p, plane);
                pout.push(t);
            }
        }
        else {
            if (inside(s, plane)) {
                var t = clip(s, p, plane);
                pout.push(t);
            }
        }

        s = p;
    }

    return pout;
};


var SCgObjectState = {
    Normal: 0,
    MergedWithMemory: 1,
    NewInMemory: 2,
    FromMemory: 3
};

var ObjectId = 0;

/**
 * Initialize sc.g-object with specified options.
 *
 * @param {Object} options
 * Initial options of object. There are possible options:
 * - observer - object, that observe this
 * - position - object position. SCg.Vector3 object
 * - scale - object size. SCg.Vector2 object.
 * - sc_type - object type. See sc-types for more info.
 * - text - text identifier of object
 */
SCg.ModelObject = function (options) {

    this.need_observer_sync = true;

    if (options.position) {
        this.position = options.position;
    } else {
        this.position = new SCg.Vector3(0.0, 0.0, 0.0);
    }

    if (options.scale) {
        this.scale = options.scale;
    } else {
        this.scale = new SCg.Vector2(20.0, 20.0);
    }

    if (options.sc_type) {
        this.sc_type = options.sc_type;
    } else {
        this.sc_type = sc_type_node;
    }

    if (options.sc_addr) {
        this.sc_addr = options.sc_addr;
    } else {
        this.sc_addr = null;
    }

    if (options.text) {
        this.text = options.text;
    } else {
        this.text = null;
    }

    this.id = ObjectId++;
    this.edges = [];    // list of connected edges
    this.need_update = true;    // update flag
    this.state = SCgObjectState.Normal;
    this.is_selected = false;
    this.scene = null;
    this.bus = null;
    this.contour = null;
};

SCg.ModelObject.prototype = {

    constructor: SCg.ModelObject

};

/**
 * Destroy object
 */
SCg.ModelObject.prototype.destroy = function () {
};

/**
 * Setup new position of object
 * @param {SCg.Vector3} pos
 *      New position of object
 */
SCg.ModelObject.prototype.setPosition = function (pos) {
    this.position = pos;
    this.need_observer_sync = true;

    this.requestUpdate();
    this.notifyEdgesUpdate();
    this.notifyBusUpdate();
};

/**
 * Setup new scale of object
 * @param {SCg.Vector2} scale
 *      New scale of object
 */
SCg.ModelObject.prototype.setScale = function (scale) {
    this.scale = scale;
    this.need_observer_sync = true;

    this.requestUpdate();
    this.update();
};

/**
 * Setup new text value
 * @param {String} text New text value
 */
SCg.ModelObject.prototype.setText = function (text) {
    this.text = text;
    this.need_observer_sync = true;
};

/**
 * Setup new type of object
 * @param {Integer} type New type value
 */
SCg.ModelObject.prototype.setScType = function (type) {
    this.sc_type = type;
    this.need_observer_sync = true;
};


/**
 * Notify all connected edges to sync
 */
SCg.ModelObject.prototype.notifyEdgesUpdate = function () {

    for (var i = 0; i < this.edges.length; i++) {
        this.edges[i].need_update = true;
        this.edges[i].need_observer_sync = true;
    }

};

/**
 * Notify connected bus to sync
 */
SCg.ModelObject.prototype.notifyBusUpdate = function () {

    if (this.bus != undefined) {
        this.bus.need_update = true;
        this.bus.need_observer_sync = true;
    }
};

/** Function iterate all objects, that need to be updated recursively, and
 * mark them for update.
 */
SCg.ModelObject.prototype.requestUpdate = function () {
    this.need_update = true;
    for (var i = 0; i < this.edges.length; ++i) {
        this.edges[i].requestUpdate();
    }

    if (this.bus != undefined) {
        this.bus.requestUpdate();
    }
};

/** Updates object state.
 */
SCg.ModelObject.prototype.update = function () {

    this.need_update = false;
    this.need_observer_sync = true;

    for (var i = 0; i < this.edges.length; ++i) {
        var edge = this.edges[i];

        if (edge.need_update) {
            edge.update();
        }
    }
};

/*! Calculate connector position.
 * @param {SCg.Vector3} Position of other end of connector
 * @param {Float} Dot position on this object.
 * @returns Returns position of connection point (new instance of SCg.Vector3, that can be modified later)
 */
SCg.ModelObject.prototype.getConnectionPos = function (from, dotPos) {
    return this.position.clone();
};

/*! Calculates dot position on object, for specified coordinates in scene
 * @param {SCg.Vector2} pos Position in scene to calculate dot position
 */
SCg.ModelObject.prototype.calculateDotPos = function (pos) {
    return 0;
};

/*! Setup new state of object
 * @param {SCgObjectState} state New object state
 */
SCg.ModelObject.prototype.setObjectState = function (state) {
    this.state = state;
    this.need_observer_sync = true;
};

/*!
 * Change value of selection flag
 */
SCg.ModelObject.prototype._setSelected = function (value) {
    this.is_selected = value;
    this.need_observer_sync = true;
};

/**
 * Remove edge from edges list
 */
SCg.ModelObject.prototype.removeEdge = function (edge) {
    var idx = this.edges.indexOf(edge);

    if (idx < 0) {
        SCg.error("Something wrong in edges deletion");
        return;
    }

    this.edges.splice(idx, 1);
};

/**
 * Remove edge from edges list
 */
SCg.ModelObject.prototype.removeBus = function () {
    this.bus = null;
};

/**
 * Setup new sc-addr of object
 * @param merged Flag that need to be true, when object merged with element in memory.
 * Automaticaly sets state MergedWithMemory
 */
SCg.ModelObject.prototype.setScAddr = function (addr, merged) {

    // remove old sc-addr from map
    if (this.sc_addr && Object.prototype.hasOwnProperty.call(this.scene.objects, this.sc_addr)) {
        delete this.scene.objects[this.sc_addr];
    }
    this.sc_addr = addr;

    //! @todo update state
    if (this.sc_addr)
        this.scene.objects[this.sc_addr] = this;

    this.need_observer_sync = true;

    if (merged == true)
        this.setObjectState(SCgObjectState.MergedWithMemory);
}

// -------------- node ---------

/**
 * Initialize sc.g-node object.
 * @param {Object} options
 *      Initial options of sc.g-node. It can include params from base object
 */
SCg.ModelNode = function (options) {

    SCg.ModelObject.call(this, options);
};

SCg.ModelNode.prototype = Object.create(SCg.ModelObject.prototype);

SCg.ModelNode.prototype.getConnectionPos = function (from, dotPos) {

    SCg.ModelObject.prototype.getConnectionPos.call(this, from, dotPos);

    var radius = this.scale.x;
    var center = this.position;

    var result = new SCg.Vector3(0, 0, 0);

    result.copyFrom(from).sub(center).normalize();
    result.multiplyScalar(radius).add(center);

    return result;
};


// ---------------- link ----------
SCg.ModelLink = function (options) {
    SCg.ModelObject.call(this, options);

    this.contentLoaded = false;
    this.containerId = options.containerId;
    this.content = options.content;
    this.contentType = 'string';
    this.fileReaderResult = null;
};

SCg.ModelLink.prototype = Object.create(SCg.ModelObject.prototype);

SCg.ModelLink.prototype.getConnectionPos = function (from, dotPos) {

    var y2 = this.scale.y * 0.5,
        x2 = this.scale.x * 0.5;

    var left = this.position.x - x2 - 5,
        top = this.position.y - y2 - 5,
        right = this.position.x + x2 + 5,
        bottom = this.position.y + y2 + 5;

    var points = SCg.Algorithms.polyclip([
        new SCg.Vector2(left, top),
        new SCg.Vector2(right, top),
        new SCg.Vector2(right, bottom),
        new SCg.Vector2(left, bottom)
    ], from, this.position);

    if (points.length == 0)
        throw "There are no intersection";

    // find shortes
    var dMin = null,
        res = null;
    for (var i = 0; i < points.length; ++i) {
        var p = points[i];
        var d = SCg.Math.distanceSquared(p, from);

        if (dMin === null || dMin > d) {
            dMin = d;
            res = p;
        }
    }

    return res ? new SCg.Vector3(res.x, res.y, this.position.z) : this.position;
};

/**
 * Setup new content value
 * @param {String} content New content value
 * @param {String} contentType Type of content (string, float, int8, int16, int32)
 */
SCg.ModelLink.prototype.setContent = function (content, contentType) {
    this.content = content;
    this.contentType = contentType ? contentType : 'string';
    this.need_observer_sync = true;
};

SCg.ModelLink.prototype.setAutoType = function () {
    function isHTML(str) {
        return /<[a-z][\s\S]*>/i.test(str);
    }

    function isFloat(value) {
        return !isNaN(value) && value.toString().indexOf('.') != -1;
    }

    if (isHTML(this.content)) {
        this.contentType = 'html';
    } else if (isFloat(this.content)) {
        this.contentType = 'float';
    } else if (!isNaN(this.content)) {
        this.contentType = 'int32';
    } else {
        this.contentType = 'string';
    }
};

// --------------- arc -----------

/**
 * Initialize sc.g-arc(edge) object
 * @param {Object} options
 *      Initial opations of sc.g-arc.
 */
SCg.ModelEdge = function (options) {

    SCg.ModelObject.call(this, options);

    this.source = null;
    this.target = null;

    if (options.source)
        this.setSource(options.source);
    if (options.target)
        this.setTarget(options.target);

    this.source_pos = null; // the begin position of egde in world coordinates
    this.target_pos = null; // the end position of edge in world coordinates
    this.points = [];
    this.source_dot = 0.5;
    this.target_dot = 0.5;

    //this.requestUpdate();
    //this.update();
};

SCg.ModelEdge.prototype = Object.create(SCg.ModelObject.prototype);

SCg.ModelEdge.prototype.setPosition = function (offset) {
    var dp = offset.clone().sub(this.position);
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].x += dp.x;
        this.points[i].y += dp.y;
    }
    SCg.ModelObject.prototype.setPosition.call(this, offset);
};

/**
 * Destroy object
 */
SCg.ModelEdge.prototype.destroy = function () {
    SCg.ModelObject.prototype.destroy.call(this);

    if (this.target)
        this.target.removeEdge(this);
    if (this.source)
        this.source.removeEdge(this);
};

/**
 * Setup new source object for sc.g-edge
 * @param {Object} scg_obj
 *      sc.g-object, that will be the source of edge
 */
SCg.ModelEdge.prototype.setSource = function (scg_obj) {

    if (this.source == scg_obj) return; // do nothing

    if (this.source)
        this.source.removeEdge(this);

    this.source = scg_obj;
    this.source.edges.push(this);
    this.need_observer_sync = true;
    this.need_update = true;
};

/**
 * Setup new value of source dot position
 */
SCg.ModelEdge.prototype.setSourceDot = function (dot) {
    this.source_dot = dot;
    this.need_observer_sync = true;
    this.need_update = true;
};

/**
 * Setup new target object for sc.g-edge
 * @param {Object} scg_obj
 *      sc.g-object, that will be the target of edge
 */
SCg.ModelEdge.prototype.setTarget = function (scg_obj) {

    if (this.target == scg_obj) return; // do nothing

    if (this.target)
        this.target.removeEdge(this);

    this.target = scg_obj;
    this.target.edges.push(this);
    this.need_observer_sync = true;
    this.need_update = true;
};

/**
 * Setup new value of target dot position
 */
SCg.ModelEdge.prototype.setTargetDot = function (dot) {
    this.target_dot = dot;
    this.need_observer_sync = true;
    this.need_update = true;
};

SCg.ModelEdge.prototype.update = function () {

    if (!this.source_pos)
        this.source_pos = this.source.position.clone();
    if (!this.target_pos)
        this.target_pos = this.target.position.clone();

    SCg.ModelObject.prototype.update.call(this);

    // calculate begin and end positions
    if (this.points.length > 0) {

        if (this.source instanceof SCg.ModelEdge) {
            this.source_pos = this.source.getConnectionPos(new SCg.Vector3(this.points[0].x, this.points[0].y, 0), this.source_dot);
            this.target_pos = this.target.getConnectionPos(new SCg.Vector3(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y, 0), this.target_dot);
        } else {
            this.target_pos = this.target.getConnectionPos(new SCg.Vector3(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y, 0), this.target_dot);
            this.source_pos = this.source.getConnectionPos(new SCg.Vector3(this.points[0].x, this.points[0].y, 0), this.source_dot);
        }

    } else {

        if (this.source instanceof SCg.ModelEdge) {
            this.source_pos = this.source.getConnectionPos(this.target_pos, this.source_dot);
            this.target_pos = this.target.getConnectionPos(this.source_pos, this.target_dot);
        } else {
            this.target_pos = this.target.getConnectionPos(this.source_pos, this.target_dot);
            this.source_pos = this.source.getConnectionPos(this.target_pos, this.source_dot);
        }
    }

    this.position.copyFrom(this.target_pos).add(this.source_pos).multiplyScalar(0.5);
};

/*! Checks if this edge need to be drawen with arrow at the end
 */
SCg.ModelEdge.prototype.hasArrow = function () {
    return this.sc_type & (sc_type_arc_common | sc_type_arc_access);
};

/*!
 * Setup new points for edge
 */
SCg.ModelEdge.prototype.setPoints = function (points) {
    this.points = points;
    this.need_observer_sync = true;
    this.requestUpdate();
};

SCg.ModelEdge.prototype.getConnectionPos = function (from, dotPos) {

    if (this.need_update) this.update();

    // first of all we need to determine sector an it relative position
    var sector = Math.floor(dotPos);
    var sector_pos = dotPos - sector;

    // now we need to determine, if sector is correct (in sector bounds)
    if ((sector < 0) || (sector > this.points.length + 1)) {
        sector = this.points.length / 2;
    }

    var beg_pos, end_pos;
    if (sector == 0) {
        beg_pos = this.source_pos;
        if (this.points.length > 0)
            end_pos = new SCg.Vector3(this.points[0].x, this.points[0].y, 0);
        else
            end_pos = this.target_pos;
    } else if (sector == this.points.length) {
        end_pos = this.target_pos;
        if (this.points.length > 0)
            beg_pos = new SCg.Vector3(this.points[sector - 1].x, this.points[sector - 1].y, 0);
        else
            beg_pos = this.source_pos;
    } else {
        if (this.points.length > sector) {
            beg_pos = new SCg.Vector3(this.points[sector - 1].x, this.points[sector - 1].y, 0);
            end_pos = new SCg.Vector3(this.points[sector].x, this.points[sector].y, 0);
        } else {
            beg_pos = new SCg.Vector3(this.source.x, this.source.y, 0);
            end_pos = new SCg.Vector3(this.target.x, this.target.y, 0);
        }
    }

    var l_pt = new SCg.Vector3(0, 0, 0);

    l_pt.copyFrom(beg_pos).sub(end_pos);
    l_pt.multiplyScalar(1 - sector_pos).add(end_pos);

    var result = new SCg.Vector3(0, 0, 0);
    result.copyFrom(from).sub(l_pt).normalize();
    result.multiplyScalar(10).add(l_pt);

    return result;
}

SCg.ModelEdge.prototype.calculateDotPos = function (pos) {

    var pts = [this.source_pos.to2d()];
    for (idx in this.points)
        pts.push(new SCg.Vector2(this.points[idx].x, this.points[idx].y));
    pts.push(this.target_pos.to2d());

    var minDist = -1.0;
    var result = 0.0;

    for (var i = 1; i < pts.length; i++) {
        var p1 = pts[i - 1];
        var p2 = pts[i];

        var v = p2.clone().sub(p1);
        var vp = pos.clone().sub(p1);

        var vn = v.clone().normalize();

        // calculate point on line
        var p = p1.clone().add(vn.clone().multiplyScalar(vn.clone().dotProduct(vp)));

        if (v.length() == 0)
            return result;

        var dotPos = p.clone().sub(p1).length() / v.length();

        if (dotPos < 0 || dotPos > 1)
            continue;

        // we doesn't need to get real length, because we need minimum
        // so we get squared length to make that procedure faster
        var d = pos.clone().sub(p).lengthSquared();

        // compare with minimum distance
        if (minDist < 0 || minDist > d) {
            minDist = d;
            result = (i - 1) + dotPos;
        }
    }

    return result;
};

//---------------- contour ----------------
/**
 * Initialize sc.g-arc(edge) object
 * @param {Object} options
 *      Initial opations of sc.g-arc.
 */
SCg.ModelContour = function (options) {

    SCg.ModelObject.call(this, options);

    this.childs = [];
    this.points = options.verticies ? options.verticies : [];
    this.sc_type = options.sc_type ? options.sc_type : sc_type_node_struct | sc_type_node;
    this.previousPoint = null;

    var cx = 0;
    var cy = 0;
    for (var i = 0; i < this.points.length; i++) {
        cx += this.points[i].x;
        cy += this.points[i].y;
    }

    cx /= this.points.length;
    cy /= this.points.length;

    this.position.x = cx;
    this.position.y = cy;
};

SCg.ModelContour.prototype = Object.create(SCg.ModelObject.prototype);


SCg.ModelContour.prototype.setPosition = function (pos) {

    var dp = pos.clone().sub(this.position);

    for (var i = 0; i < this.childs.length; i++) {
        var newPos = this.childs[i].position.clone().add(dp);
        this.childs[i].setPosition(newPos);
    }

    for (var i = 0; i < this.points.length; i++) {
        this.points[i].x += dp.x;
        this.points[i].y += dp.y;
    }

    SCg.ModelObject.prototype.setPosition.call(this, pos);
};

SCg.ModelContour.prototype.update = function () {
    SCg.ModelObject.prototype.update.call(this);
};

/**
 * Append new child into contour
 * @param {SCg.ModelObject} child Child object to append
 */
SCg.ModelContour.prototype.addChild = function (child) {
    this.childs.push(child);
    child.contour = this;
};

/**
 * Remove child from contour
 * @param {SCg.ModelObject} child Child object for remove
 */
SCg.ModelContour.prototype.removeChild = function (child) {
    var idx = this.childs.indexOf(child);
    this.childs.splice(idx, 1);
    child.contour = null;
};

SCg.ModelContour.prototype.isNodeInPolygon = function (node) {
    return SCg.Algorithms.isPointInPolygon(node.position, this.points);
};

/**
 * Convenient function for testing, which does mass checking nodes is in the contour
 * and adds them to childs of the contour
 * @param nodes array of {SCg.ModelNode}
 */
SCg.ModelContour.prototype.addNodesWhichAreInContourPolygon = function (nodes) {
    for (var i = 0; i < nodes.length; i++) {
        if (!nodes[i].contour && this.isNodeInPolygon(nodes[i])) {
            this.addChild(nodes[i]);
        }
    }
};

SCg.ModelContour.prototype.isEdgeInPolygon = function (edge) {
    return !edge.contour && this.isNodeInPolygon(edge.source) && this.isNodeInPolygon(edge.target);
};

SCg.ModelContour.prototype.addEdgesWhichAreInContourPolygon = function (edges) {
    for (var i = 0; i < edges.length; i++) {
        if (this.isEdgeInPolygon(edges[i])) {
            this.addChild(edges[i]);
        }
    }
};

SCg.ModelContour.prototype.getConnectionPos = function (from, dotPos) {
    var points = SCg.Algorithms.polyclip(this.points, from, this.position);
    var nearestIntersectionPoint = new SCg.Vector3(points[0].x, points[0].y, 0);
    for (var i = 1; i < points.length; i++) {
        var nextPoint = new SCg.Vector3(points[i].x, points[i].y, 0);
        var currentLength = from.clone().sub(nearestIntersectionPoint).length();
        var newLength = from.clone().sub(nextPoint).length();
        if (currentLength > newLength) {
            nearestIntersectionPoint = nextPoint;
        }
    }
    return nearestIntersectionPoint;
};

SCg.ModelContour.prototype.getCenter = function () {
    var center = new SCg.Vector3();

    center.x = this.points[0].x;
    center.y = this.points[1].x;
    center.z = 0;

    for (var i = i; i < points.length; ++i) {
        var p = points[i];

        center.x += p.x;
        center.y += p.y;
    }

    center.x /= points.length;
    center.y /= points.length;

    return center;
};

SCg.ModelBus = function (options) {

    SCg.ModelObject.call(this, options);
    this.id_bus = this.id;
    this.source = null;
    if (options.source)
        this.setSource(options.source);
    this.source_pos = null; // the begin position of bus in world coordinates
    this.target_pos = null; // the end position of bus in world coordinates
    this.points = [];
    this.source_dot = 0.5;
    this.target_dot = 0.5;
    this.previousPoint = null;
    //this.requestUpdate();
    //this.update();
};

SCg.ModelBus.prototype = Object.create(SCg.ModelObject.prototype);

SCg.ModelBus.prototype.setPosition = function (offset) {
    var dp = offset.clone().sub(this.position);
    for (var i = 0; i < this.points.length; i++) {
        this.points[i].x += dp.x;
        this.points[i].y += dp.y;
    }
    SCg.ModelObject.prototype.setPosition.call(this, offset);
};

SCg.ModelBus.prototype.update = function () {

    if (!this.source_pos)
        this.source_pos = this.source.position.clone();
    if (!this.target_pos) {
        var target = this.points[this.points.length - 1];
        this.target_pos = new SCg.Vector3(target.x, target.y, 0);
    }
    SCg.ModelObject.prototype.update.call(this);

    // calculate begin and end positions
    if (this.points.length > 0) {

        if (this.source instanceof SCg.ModelEdge) {
            this.source_pos = this.source.getConnectionPos(new SCg.Vector3(this.points[0].x, this.points[0].y, 0), this.source_dot);
        } else {
            this.source_pos = this.source.getConnectionPos(new SCg.Vector3(this.points[0].x, this.points[0].y, 0), this.source_dot);
        }

    } else {

        if (this.source instanceof SCg.ModelEdge) {
            this.source_pos = this.source.getConnectionPos(this.target_pos, this.source_dot);
        } else {
            this.source_pos = this.source.getConnectionPos(this.target_pos, this.source_dot);
        }
    }

    this.position.copyFrom(this.target_pos).add(this.source_pos).multiplyScalar(0.5);
};

SCg.ModelBus.prototype.setSource = function (scg_obj) {
    if (this.source) this.source.removeBus();
    this.source = scg_obj;
    this.id = scg_obj.id;
    this.source.bus = this;
    this.need_observer_sync = true;
    this.need_update = true;
};

/**
 * Setup new value of source dot position
 */
SCg.ModelBus.prototype.setSourceDot = function (dot) {
    this.source_dot = dot;
    this.need_observer_sync = true;
    this.need_update = true;
};

/**
 * Setup new value of target dot position
 */
SCg.ModelBus.prototype.setTargetDot = function (dot) {
    this.target_dot = dot;
    this.need_observer_sync = true;
    this.need_update = true;
};

/*!
 * Setup new points for bus
 */
SCg.ModelBus.prototype.setPoints = function (points) {
    this.points = points;
    this.need_observer_sync = true;
    this.requestUpdate();
};

SCg.ModelBus.prototype.getConnectionPos = SCg.ModelEdge.prototype.getConnectionPos;

SCg.ModelBus.prototype.calculateDotPos = SCg.ModelEdge.prototype.calculateDotPos;

SCg.ModelBus.prototype.changePosition = function (mouse_pos) {

    var dx = mouse_pos.x - this.previousPoint.x,
        dy = mouse_pos.y - this.previousPoint.y,
        diff = new SCg.Vector3(dx, dy, 0);

    this.position.add(diff);

    for (var i = 0; i < this.points.length; i++) {
        this.points[i].x += diff.x;
        this.points[i].y += diff.y;
    }

    var new_pos = this.source.position.clone().add(diff);
    this.source.setPosition(new_pos);


    this.previousPoint.x = mouse_pos.x;
    this.previousPoint.y = mouse_pos.y;

    this.need_observer_sync = true;

    this.requestUpdate();
    this.notifyEdgesUpdate();
};

SCg.ModelBus.prototype.destroy = function () {
    SCg.ModelObject.prototype.destroy.call(this);
    if (this.source)
        this.source.removeBus();
};



var SCgAlphabet = {

    scType2Str: {},

    /**
     * Initialize all definitions, for svg drawer
     */
    initSvgDefs: function (defs, containerId) {

        this.initTypesMapping();

        // edge markers
        defs.append('svg:marker')
            .attr('id', 'end-arrow-access_' + containerId).attr('viewBox', '0 -5 10 10').attr('refX', 0)
            .attr('markerWidth', 5).attr('markerHeight', 10).attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-4L10,0L0,4').attr('fill', '#000');

        defs.append('svg:marker')
            .attr('id', 'end-arrow-common_' + containerId).attr('viewBox', '0 -5 10 10').attr('refX', 0)
            .attr('markerWidth', 1.5).attr('markerHeight', 6).attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-4L10,0L0,4').attr('fill', '#000');

        // nodes
        defs.append('svg:circle').attr('id', 'scg.node.const.outer').attr('cx', '0').attr('cy', '0').attr('r', '10');
        defs.append('svg:rect').attr('id', 'scg.node.var.outer').attr('x', '-10').attr('y', '-10').attr('width', '20').attr('height', '20');

        defs.append('svg:clip-path')
            .attr('id', 'scg.node.const.clip')
            .append('svg:use')
            .attr('xlink:href', '#scg.node.const.clip');

        defs.append('svg:clip-path')
            .attr('id', 'scg.node.var.clip')
            .append('svg:use')
            .attr('xlink:href', '#scg.node.var.clip');


        //  ----- define constant nodes -----      
        var g = defs.append('svg:g').attr('id', 'scg.node');
        g.append('svg:circle').attr('cx', '0').attr('cy', '0').attr('r', '5');
        g.append('svg:text').attr('x', '7').attr('y', '15').attr('class', 'SCgText');

        g = defs.append('svg:g').attr('id', 'scg.node.const');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.const.tuple');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.const.struct');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:circle').attr('cx', '0').attr('cy', '0').attr('r', '3').attr('stroke', 'none').attr('fill', '#000');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.const.role');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:line').attr('x1', '0').attr('x2', '0').attr('y1', '-10').attr('y2', '10').attr('stroke-width', '3');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.const.norole');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.const.class');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.const.abstract');//.attr('clip-path', 'url(#scg.node.const.clip)');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.const.material');//.attr('clip-path', 'url(#scg.node.const.clip)');
        g.append('svg:use').attr('xlink:href', '#scg.node.const.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1').attr('transform', 'rotate(-45, 0, 0)');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);


        //  ----- define variable nodes -----
        g = defs.append('svg:g').attr('id', 'scg.node.var');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.var.tuple');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.var.struct');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:circle').attr('cx', '0').attr('cy', '0').attr('r', '3').attr('stroke', 'none').attr('fill', '#000');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.var.role');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:line').attr('x1', '0').attr('x2', '0').attr('y1', '-10').attr('y2', '10').attr('stroke-width', '3');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.var.norole');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.var.class');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.var.abstract');//.attr('clip-path', 'url(#scg.node.var.clip)');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.node.var.material');//.attr('clip-path', 'url(#scg.node.var.clip)');
        g.append('svg:use').attr('xlink:href', '#scg.node.var.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1').attr('transform', 'rotate(-45, 0, 0)');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'scg.link');
        g.append('svg:rect').attr('fill', '#aaa').attr('stroke-width', '6');
    },

    /**
     * Append sc.g-text to definition
     */
    appendText: function (def, x, y) {
        def.append('svg:text')
            .attr('x', '17')
            .attr('y', '21')
            .attr('class', 'SCgText')
    },

    /**
     * Return definition name by sc-type
     */
    getDefId: function (sc_type) {
        if (this.scType2Str.hasOwnProperty(sc_type)) {
            return this.scType2Str[sc_type];
        }

        return 'scg.node';
    },

    /**
     * Initialize sc-types mapping
     */
    initTypesMapping: function () {
        this.scType2Str[sc_type_node] = 'scg.node';
        this.scType2Str[sc_type_node | sc_type_const] = 'scg.node.const';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_material] = 'scg.node.const.material';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_abstract] = 'scg.node.const.abstract';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_class] = 'scg.node.const.class';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_struct] = 'scg.node.const.struct';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_norole] = 'scg.node.const.norole';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_role] = 'scg.node.const.role';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_tuple] = 'scg.node.const.tuple';

        this.scType2Str[sc_type_node | sc_type_var] = 'scg.node.var';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_material] = 'scg.node.var.material';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_abstract] = 'scg.node.var.abstract';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_class] = 'scg.node.var.class';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_struct] = 'scg.node.var.struct';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_norole] = 'scg.node.var.norole';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_role] = 'scg.node.var.role';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_tuple] = 'scg.node.var.tuple';

        this.scType2Str[sc_type_link] = 'scg.link';
    },

    /**
     * All sc.g-edges represented by group of paths, so we need to update whole group.
     * This function do that work
     * @param egde {SCg.ModelEdge} Object that represent sc.g-edge
     * @param d3_group {} Object that represents svg group
     */
    updateEdge: function (edge, d3_group, containerId) {

        // first of all we need to determine if edge has an end marker
        var has_marker = edge.hasArrow();

        // now calculate target and source positions
        var pos_src = edge.source_pos.clone();
        var pos_trg = edge.target_pos.clone();

        // if we have an arrow, then need to fix end position
        if (has_marker) {
            var prev_pos = pos_src;
            if (edge.points.length > 0) {
                prev_pos = new SCg.Vector3(edge.points[edge.points.length - 1].x, edge.points[edge.points.length - 1].y, 0);
            }

            var dv = pos_trg.clone().sub(prev_pos);
            var len = dv.length();
            dv.normalize();
            pos_trg = prev_pos.clone().add(dv.multiplyScalar(len - 10));
        }

        // make position path
        var position_path = 'M' + pos_src.x + ',' + pos_src.y;
        for (idx in edge.points) {
            position_path += 'L' + edge.points[idx].x + ',' + edge.points[idx].y;
        }
        position_path += 'L' + pos_trg.x + ',' + pos_trg.y;

        var sc_type_str = edge.sc_type.toString();
        if (d3_group['sc_type'] != sc_type_str) {
            d3_group.attr('sc_type', sc_type_str);

            // remove old
            d3_group.selectAll('path').remove();

            d3_group.append('svg:path').classed('SCgEdgeSelectBounds', true).attr('d', position_path);

            // if it accessory, then append main line
            if (edge.sc_type & sc_type_arc_access) {

                var main_style = 'SCgEdgeAccessPerm';
                if (edge.sc_type & sc_type_arc_temp) {
                    main_style = edge.sc_type & sc_type_var ? 'SCgEdgeAccessTempVar' : 'SCgEdgeAccessTemp';
                }

                var p = d3_group.append('svg:path')
                    .classed(main_style, true)
                    .classed('SCgEdgeEndArrowAccess', true)
                    .style("marker-end", "url(#end-arrow-access_" + containerId + ")")
                    .attr('d', position_path);

                if (edge.sc_type & sc_type_constancy_mask) {
                    p.classed('SCgEdgeVarDashAccessPerm', (edge.sc_type & sc_type_var) && (edge.sc_type & sc_type_arc_perm));
                } else {
                    d3_group.append('svg:path')
                        .classed('SCgEdgeAccessComonDash', true)
                        .attr('d', position_path);
                }

                if (edge.sc_type & sc_type_arc_neg) {
                    d3_group.append('svg:path')
                        .classed('SCgEdgePermNegDash', true)
                        .attr('d', position_path);
                }
            } else if (edge.sc_type & (sc_type_arc_common | sc_type_edge_common)) {

                if (edge.sc_type & sc_type_edge_common) {
                    d3_group.append('svg:path')
                        .classed('SCgEdgeCommonBack', true)
                        .attr('d', position_path);
                }

                if (edge.sc_type & sc_type_arc_common) {
                    d3_group.append('svg:path')
                        .classed('SCgEdgeCommonBack', true)
                        .classed('SCgEdgeEndArrowCommon', edge.sc_type & sc_type_arc_common)
                        .style("marker-end", "url(#end-arrow-common_" + containerId + ")")
                        .attr('d', position_path);
                }

                d3_group.append('svg:path')
                    .classed('SCgEdgeCommonForeground', true)
                    .attr('d', position_path)

                if (edge.sc_type & sc_type_constancy_mask) {
                    if (edge.sc_type & sc_type_var) {
                        d3_group.append('svg:path')
                            .classed('SCgEdgeCommonForegroundVar', true)
                            .classed('SCgEdgeVarDashCommon', true)
                            .attr('d', position_path);
                    }
                } else {
                    d3_group.append('svg:path')
                        .classed('SCgEdgeAccessPerm', true)
                        .classed('SCgEdgeVarDashCommon', true)
                        .attr('d', position_path);
                }

            } else {
                // unknown
                d3_group.append('svg:path')
                    .classed('SCgEdgeUnknown', true)
                    .attr('d', position_path);
            }

        } else {
            // update existing
            d3_group.selectAll('path')
                .attr('d', position_path);
        }

        // now we need to draw fuz markers (for now it not supported)
        if (edge.sc_type & sc_type_arc_fuz) {
            d3_group.selectAll('path').attr('stroke', '#f00');
            d3_group.append('svg:path')
                .classed('SCgEdgeFuzDash', true)
                .attr('d', position_path)
                .attr('stroke', '#f00');
        }

    },

    updateBus: function (bus, d3_group) {

        var pos_src = bus.source_pos.clone();

        // make position path
        var position_path = 'M' + pos_src.x + ',' + pos_src.y;
        for (idx in bus.points) {
            position_path += 'L' + bus.points[idx].x + ',' + bus.points[idx].y;
        }

        if (d3_group[0][0].childElementCount == 0) {

            d3_group.append('svg:path').classed('SCgBusPath', true).attr('d', position_path);

            // if it accessory, then append main line


        } else {
            // update existing
            d3_group.selectAll('path')
                .attr('d', position_path);
        }

    }
};

SCg.Render = function () {
    this.scene = null;
};

SCg.Render.prototype = {

    init: function (params) {
        this.containerId = params.containerId;
        this.sandbox = params.sandbox;

        this.linkBorderWidth = 5;
        this.scale = 1;
        this.translate = [0, 0];
        this.translate_started = false;

        // disable tooltips
        $('#' + this.containerId).parent().addClass('ui-no-tooltip');

        var scgViewer = $('#scg-viewer');
        this.d3_drawer = d3.select('#' + this.containerId)
            .append("svg:svg")
            .attr("pointer-events", "all")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("class", "SCgSvg")
            .on('mousemove', function () {
                self.onMouseMove(this, self);
            })
            .on('mousedown', function () {
                self.onMouseDown(this, self)
            })
            .on('mouseup', function () {
                self.onMouseUp(this, self);
            })
            .on('dblclick', function () {
                self.onMouseDoubleClick(this, self);
            });

        this.scale = 1;
        var self = this;
        this.d3_container = this.d3_drawer.append('svg:g')
            .attr("class", "SCgSvg");

        this.initDefs();

        /* this.d3_container.append('svg:rect')
         .style("fill", "url(#backGrad)")
         .attr('width', '10000') //parseInt(this.d3_drawer.style("width")))
         .attr('height', '10000');//parseInt(this.d3_drawer.style("height")));
         */

        this.d3_drag_line = this.d3_container.append('svg:path')
            .attr('class', 'dragline hidden')
            .attr('d', 'M0,0L0,0');
        this.d3_contour_line = d3.svg.line().interpolate("cardinal-closed");
        this.d3_contours = this.d3_container.append('svg:g').selectAll('path');
        this.d3_accept_point = this.d3_container.append('svg:use')
            .attr('class', 'SCgAcceptPoint hidden')
            .attr('xlink:href', '#acceptPoint')
            .on('mouseover', function (d) {
                d3.select(this).classed('SCgAcceptPointHighlighted', true);
            })
            .on('mouseout', function (d) {
                d3.select(this).classed('SCgAcceptPointHighlighted', false);
            })
            .on('mousedown', function (d) {
                self.scene.listener.finishCreation();
                d3.event.stopPropagation();
            });
        this.d3_edges = this.d3_container.append('svg:g').selectAll('path');
        this.d3_buses = this.d3_container.append('svg:g').selectAll('path');
        this.d3_nodes = this.d3_container.append('svg:g').selectAll('g');
        this.d3_links = this.d3_container.append('svg:g').selectAll('g');
        this.d3_dragline = this.d3_container.append('svg:g');
        this.d3_line_points = this.d3_container.append('svg:g');

        this.line_point_idx = -1;
    },

    // -------------- Definitions --------------------
    initDefs: function () {
        // define arrow markers for graph links
        var defs = this.d3_drawer.append('svg:defs')

        SCgAlphabet.initSvgDefs(defs, this.containerId);

        var grad = defs.append('svg:radialGradient')
            .attr('id', 'backGrad')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '100%').attr("spreadMethod", "pad");

        grad.append('svg:stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgb(255,253,252)')
            .attr('stop-opacity', '1')
        grad.append('svg:stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgb(245,245,245)')
            .attr('stop-opacity', '1')

        // line point control
        var p = defs.append('svg:g')
            .attr('id', 'linePoint')
        p.append('svg:circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 10);

        p = defs.append('svg:g')
            .attr('id', 'acceptPoint')
        p.append('svg:circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 10)
        p.append('svg:path')
            .attr('d', 'M-5,-5 L0,5 5,-5');
        p = defs.append('svg:g')
            .attr('id', 'removePoint')
        p.append('svg:circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 10)

        p.append('svg:path')
            .attr('d', 'M-5,-5L5,5M-5,5L5,-5');
    },

    classState: function (obj, base) {

        var res = 'sc-no-default-cmd ui-no-tooltip SCgElement';

        if (base)
            res += ' ' + base;

        if (obj.is_selected)
            res += ' SCgStateSelected';

        if (obj.is_highlighted)
            res += ' SCgStateHighlighted ';

        switch (obj.state) {
            case SCgObjectState.FromMemory:
                res += ' SCgStateFromMemory';
                break;
            case SCgObjectState.MergedWithMemory:
                res += ' SCgStateMergedWithMemory';
                break;
            case SCgObjectState.NewInMemory:
                res += ' SCgStateNewInMemory';
                break;
            default:
                res += ' SCgStateNormal';
        }
        ;

        return res;
    },

    classToogle: function (o, cl, flag) {

        var item = d3.select(o);
        var str = item.attr("class");
        var res = str ? str.replace(cl, '') : '';
        res = res.replace('  ', ' ');
        if (flag)
            res += ' ' + cl;
        item.attr("class", res);
    },

    // -------------- draw -----------------------
    update: function () {

        var self = this;

        function eventsWrap(selector) {
            selector.on('mouseover', function (d) {
                self.classToogle(this, 'SCgStateHighlighted', true);
                if (self.scene.onMouseOverObject(d))
                    d3.event.stopPropagation();
            })
                .on('mouseout', function (d) {
                    self.classToogle(this, 'SCgStateHighlighted', false);
                    if (self.scene.onMouseOutObject(d))
                        d3.event.stopPropagation();
                })
                .on('mousedown', function (d) {
                    self.scene.onMouseDownObject(d);
                    if (d3.event.stopPropagation())
                        d3.event.stopPropagation();
                })
                .on('mouseup', function (d) {
                    self.scene.onMouseUpObject(d);
                    if (d3.event.stopPropagation())
                        d3.event.stopPropagation();
                })
                .on("dblclick", d => {
                    if (d3.event.stopPropagation())
                        d3.event.stopPropagation();
                    let windowId = SCWeb.ui.WindowManager.getActiveWindowId();
                    let container = document.getElementById(windowId);
                    SCWeb.core.Main.doDefaultCommandWithFormat([d.sc_addr], $(container).attr("sc-addr-fmt"));
                });
        };

        function appendNodeVisual(g) {
            g.append('svg:use')
                .attr('xlink:href', function (d) {
                    return '#' + SCgAlphabet.getDefId(d.sc_type);
                })
                .attr('class', 'sc-no-default-cmd ui-no-tooltip');
        };


        // add nodes that haven't visual
        this.d3_nodes = this.d3_nodes.data(this.scene.nodes, function (d) {
            return d.id;
        });

        var g = this.d3_nodes.enter().append('svg:g')
            .attr('class', function (d) {
                return self.classState(d, (d.sc_type & sc_type_constancy_mask) ? 'SCgNode' : 'SCgNodeEmpty');
            })
            .attr("transform", function (d) {
                return 'translate(' + d.position.x + ', ' + d.position.y + ')';
            });
        eventsWrap(g);
        appendNodeVisual(g);

        g.append('svg:text')
            .attr('class', 'SCgText')
            .attr('x', function (d) {
                return d.scale.x / 1.3;
            })
            .attr('y', function (d) {
                return d.scale.y / 1.3;
            })
            .text(function (d) {
                return d.text;
            });

        this.d3_nodes.exit().remove();

        // add links that haven't visual
        this.d3_links = this.d3_links.data(this.scene.links, function (d) {
            return d.id;
        });

        g = this.d3_links.enter().append('svg:g')
            .attr("transform", function (d) {
                return 'translate(' + d.position.x + ', ' + d.position.y + ')';
            })

        g.append('svg:rect')
            .attr('class', function (d) {
                return self.classState(d, 'SCgLink');
            })
            .attr('class', 'sc-no-default-cmd ui-no-tooltip');

        g.append('svg:foreignObject')
            .attr('transform', 'translate(' + self.linkBorderWidth * 0.5 + ',' + self.linkBorderWidth * 0.5 + ')')
            .attr("width", "100%")
            .attr("height", "100%")
            .append("xhtml:link_body")
            .style("background", "transparent")
            .style("margin", "0 0 0 0")
            .html(function (d) {
                return '<div id="link_' + self.containerId + '_' + d.id + '" class=\"SCgLinkContainer\"><div id="' + d.containerId + '" style="display: inline-block;" class="impl"></div></div>';
            });


        eventsWrap(g);

        this.d3_links.exit().remove();

        // update edges visual
        this.d3_edges = this.d3_edges.data(this.scene.edges, function (d) {
            return d.id;
        });

        // add edges that haven't visual
        g = this.d3_edges.enter().append('svg:g')
            .attr('class', function (d) {
                return self.classState(d, 'SCgEdge');
            })
            .attr('pointer-events', 'visibleStroke');

        eventsWrap(g);

        this.d3_edges.exit().remove();

        // update contours visual
        this.d3_contours = this.d3_contours.data(this.scene.contours, function (d) {
            return d.id;
        });

        g = this.d3_contours.enter().append('svg:polygon')
            .attr('class', function (d) {
                return self.classState(d, 'SCgContour');
            })
            .attr('points', function (d) {
                var verticiesString = "";
                for (var i = 0; i < d.points.length; i++) {
                    var vertex = d.points[i].x + ', ' + d.points[i].y + ' ';
                    verticiesString = verticiesString.concat(vertex);
                }
                return verticiesString;
            })
            .attr('title', function (d) {
                return d.text;
            });
        eventsWrap(g);

        this.d3_contours.exit().remove();

        // update buses visual
        this.d3_buses = this.d3_buses.data(this.scene.buses, function (d) {
            return d.id;
        });

        g = this.d3_buses.enter().append('svg:g')
            .attr('class', function (d) {
                return self.classState(d, 'SCgBus');
            })
            .attr('pointer-events', 'visibleStroke');
        eventsWrap(g);

        this.d3_buses.exit().remove();

        this.updateObjects();
    },


    // -------------- update objects --------------------------
    updateObjects: function () {

        var self = this;
        this.d3_nodes.each(function (d) {

            if (!d.need_observer_sync) return; // do nothing

            d.need_observer_sync = false;

            var g = d3.select(this)
                .attr("transform", 'translate(' + d.position.x + ', ' + d.position.y + ')')
                .attr('class', function (d) {
                    return self.classState(d, (d.sc_type & sc_type_constancy_mask) ? 'SCgNode' : 'SCgNodeEmpty');
                })

            g.select('use')
                .attr('xlink:href', function (d) {
                    return '#' + SCgAlphabet.getDefId(d.sc_type);
                })
                .attr("sc_addr", function (d) {
                    return d.sc_addr;
                });

            g.selectAll('text').text(function (d) {
                return d.text;
            });
        });

        this.d3_links.each(function (d) {

            if (!d.need_observer_sync && d.contentLoaded) return; // do nothing

            if (!d.contentLoaded) {
                var links = {};
                links[d.containerId] = d.sc_addr;
                self.sandbox.createViewersForScLinks(links);

                d.contentLoaded = true;
            }
            else
                d.need_observer_sync = false;

            var linkDiv = $(document.getElementById("link_" + self.containerId + "_" + d.id));
            if (!d.sc_addr) {
                linkDiv.find('.impl').html(d.content);
            } else {
                if (d.content != "") {
                    linkDiv.find('.impl').html(d.content);
                } else {
                    d.content = linkDiv.find('.impl').html();
                    if (d.content != "") {
                        d.setAutoType();
                    }
                }
            }

            var g = d3.select(this)

            g.select('rect')
                .attr('width', function (d) {
                    d.scale.x = Math.min(linkDiv.find('.impl').outerWidth(), 450) + 10;
                    return d.scale.x + self.linkBorderWidth;
                })
                .attr('height', function (d) {
                    d.scale.y = Math.min(linkDiv.outerHeight(), 350);
                    return d.scale.y + self.linkBorderWidth;
                })
                .attr('class', function (d) {
                    return self.classState(d, 'SCgLink');
                }).attr("sc_addr", function (d) {
                return d.sc_addr;
            });

            g.selectAll(function () {
                return this.getElementsByTagName("foreignObject");
            })
                .attr('width', function (d) {
                    return d.scale.x;
                })
                .attr('height', function (d) {

                    return d.scale.y;
                });

            g.attr("transform", function (d) {
                return 'translate(' + (d.position.x - (d.scale.x + self.linkBorderWidth) * 0.5) + ', ' + (d.position.y - (d.scale.y + self.linkBorderWidth) * 0.5) + ')';
            });

        });

        this.d3_edges.each(function (d) {

            if (!d.need_observer_sync) return; // do nothing
            d.need_observer_sync = false;

            if (d.need_update)
                d.update();
            var d3_edge = d3.select(this);
            SCgAlphabet.updateEdge(d, d3_edge, self.containerId);
            d3_edge.attr('class', function (d) {
                return self.classState(d, 'SCgEdge');
            })
                .attr("sc_addr", function (d) {
                    return d.sc_addr;
                });
        });

        this.d3_contours.each(function (d) {

            d3.select(this).attr('d', function (d) {

                if (!d.need_observer_sync) return; // do nothing

                if (d.need_update)
                    d.update();

                var d3_contour = d3.select(this);

                d3_contour.attr('class', function (d) {
                    return self.classState(d, 'SCgContour');
                });

                d3_contour.attr('points', function (d) {
                    var verticiesString = "";
                    for (var i = 0; i < d.points.length; i++) {
                        var vertex = d.points[i].x + ', ' + d.points[i].y + ' ';
                        verticiesString = verticiesString.concat(vertex);
                    }
                    return verticiesString;
                });

                d3_contour.attr('title', function (d) {
                    return d.text;
                });

                d.need_update = false;
                d.need_observer_sync = false;

                return self.d3_contour_line(d.points) + 'Z';
            })
                .attr("sc_addr", function (d) {
                    return d.sc_addr;
                });
        });

        this.d3_buses.each(function (d) {

            if (!d.need_observer_sync) return; // do nothing
            d.need_observer_sync = false;

            if (d.need_update)
                d.update();
            var d3_bus = d3.select(this);
            SCgAlphabet.updateBus(d, d3_bus);
            d3_bus.attr('class', function (d) {
                return self.classState(d, 'SCgBus');
            });
        });

        this.updateLinePoints();
    },

    updateTexts: function () {
        this.d3_nodes.select('text').text(function (d) {
            return d.text;
        });
    },

    requestUpdateAll: function () {
        this.d3_nodes.each(function (d) {
            d.need_observer_sync = true;
        });
        this.d3_links.each(function (d) {
            d.need_observer_sync = true;
        });
        this.d3_edges.each(function (d) {
            d.need_observer_sync = true;
            d.need_update = true;
        });
        this.d3_contours.each(function (d) {
            d.need_observer_sync = true;
            d.need_update = true;
        });
        this.d3_buses.each(function (d) {
            d.need_observer_sync = true;
            d.need_update = true;
        });
        this.update();
    },

    updateDragLine: function () {
        var self = this;


        this.d3_drag_line.classed('SCgBus', this.scene.edit_mode == SCgEditMode.SCgModeBus)
            .classed('dragline', true)
            .classed('draglineBus', this.scene.edit_mode == SCgEditMode.SCgModeBus);

        // remove old points
        drag_line_points = this.d3_dragline.selectAll('use.SCgRemovePoint');
        points = drag_line_points.data(this.scene.drag_line_points, function (d) {
            return d.idx;
        })
        points.exit().remove();

        points.enter().append('svg:use')
            .attr('class', 'SCgRemovePoint')
            .attr('xlink:href', '#removePoint')
            .attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            })
            .on('mouseover', function (d) {
                d3.select(this).classed('SCgRemovePointHighlighted', true);
            })
            .on('mouseout', function (d) {
                d3.select(this).classed('SCgRemovePointHighlighted', false);
            })
            .on('mousedown', function (d) {
                self.scene.revertDragPoint(d.idx);
                d3.event.stopPropagation();
            });


        if (this.scene.edit_mode == SCgEditMode.SCgModeBus || this.scene.edit_mode == SCgEditMode.SCgModeContour) {
            this.d3_accept_point.classed('hidden', this.scene.drag_line_points.length == 0);
            if (this.scene.drag_line_points.length > 0) {
                var pos = this.scene.drag_line_points[0];
                if (this.scene.edit_mode == SCgEditMode.SCgModeBus)
                    pos = this.scene.drag_line_points[this.scene.drag_line_points.length - 1];
                this.d3_accept_point.attr('transform', 'translate(' + (pos.x + 24) + ',' + pos.y + ')');
            }
        } else {
            this.d3_accept_point.classed('hidden', true);
        }

        if (this.scene.drag_line_points.length < 1) {
            this.d3_drag_line.classed('hidden', true);
        } else {

            this.d3_drag_line.classed('hidden', false);

            var d_str = '';
            // create path description
            for (idx in this.scene.drag_line_points) {
                var pt = this.scene.drag_line_points[idx];

                if (idx == 0)
                    d_str += 'M';
                else
                    d_str += 'L';
                d_str += pt.x + ',' + pt.y;
            }

            d_str += 'L' + this.scene.mouse_pos.x + ',' + this.scene.mouse_pos.y;

            // update drag line
            this.d3_drag_line.attr('d', d_str);
        }
    },

    updateLinePoints: function () {
        var self = this;
        var oldPoints;

        line_points = this.d3_line_points.selectAll('use');
        points = line_points.data(this.scene.line_points, function (d) {
            return d.idx;
        })
        points.exit().remove();

        if (this.scene.line_points.length == 0)
            this.line_points_idx = -1;

        points.enter().append('svg:use')
            .classed('SCgLinePoint', true)
            .attr('xlink:href', '#linePoint')
            .attr('transform', function (d) {
                return 'translate(' + d.pos.x + ',' + d.pos.y + ')';
            })
            .on('mouseover', function (d) {
                d3.select(this).classed('SCgLinePointHighlighted', true);
            })
            .on('mouseout', function (d) {
                d3.select(this).classed('SCgLinePointHighlighted', false);
            })
            .on('mousedown', function (d) {
                if (self.line_point_idx < 0) {
                    oldPoints = $.map(self.scene.selected_objects[0].points, function (vertex) {
                        return $.extend({}, vertex);
                    });
                    self.line_point_idx = d.idx;
                } else {
                    var newPoints = $.map(self.scene.selected_objects[0].points, function (vertex) {
                        return $.extend({}, vertex);
                    });
                    self.scene.commandManager.execute(new SCgCommandMovePoint(self.scene.selected_objects[0],
                        oldPoints,
                        newPoints,
                        self.scene),
                        true);
                    self.line_point_idx = -1;
                }
            })
            .on('dblclick', function (d) {
                self.line_point_idx = -1;
            });
        /*.on('mouseup', function(d) {
         self.scene.pointed_object = null;
         });*/

        line_points.each(function (d) {
            d3.select(this).attr('transform', function (d) {
                return 'translate(' + d.pos.x + ',' + d.pos.y + ')';
            });
        });
    },

    _changeContainerTransform: function (translate, scale) {
        this.d3_container.attr("transform", "translate(" + this.translate + ")scale(" + this.scale + ")");
    },

    changeScale: function (mult) {
        if (mult === 0)
            throw "Invalid scale multiplier";

        this.scale *= mult;
        var scale = Math.max(2, Math.min(0.1, this.scale));
        this._changeContainerTransform();
    },

    changeTranslate: function (delta) {

        this.translate[0] += delta[0] * this.scale;
        this.translate[1] += delta[1] * this.scale;

        this._changeContainerTransform();
    },

    // --------------- Events --------------------
    _correctPoint: function (p) {
        p[0] -= this.translate[0];
        p[1] -= this.translate[1];

        p[0] /= this.scale;
        p[1] /= this.scale;
        return p;
    },

    onMouseDown: function (window, render) {
        var point = this._correctPoint(d3.mouse(window));
        if (render.scene.onMouseDown(point[0], point[1]))
            return;

        this.translate_started = true;
    },

    onMouseUp: function (window, render) {

        if (this.translate_started) {
            this.translate_started = false;
            return;
        }

        var point = this._correctPoint(d3.mouse(window));

        if (this.line_point_idx >= 0) {
            this.line_point_idx = -1;
            d3.event.stopPropagation();
            return;
        }

        if (render.scene.onMouseUp(point[0], point[1]))
            d3.event.stopPropagation();
    },

    onMouseMove: function (window, render) {

        if (this.translate_started)
            this.changeTranslate([d3.event.movementX, d3.event.movementY]);

        var point = this._correctPoint(d3.mouse(window));

        if (this.line_point_idx >= 0) {
            this.scene.setLinePointPos(this.line_point_idx, {x: point[0], y: point[1]});
            d3.event.stopPropagation();
        }

        if (render.scene.onMouseMove(point[0], point[1]))
            d3.event.stopPropagation();
    },

    onMouseDoubleClick: function (window, render) {
        var point = this._correctPoint(d3.mouse(window));
        if (this.scene.onMouseDoubleClick(point[0], point[1]))
            d3.event.stopPropagation();
    },

    onKeyDown: function (event) {
        // do not send event to other listeners, if it processed in scene
        if (this.scene.onKeyDown(event))
            d3.event.stopPropagation();
    },

    onKeyUp: function (event) {
        // do not send event to other listeners, if it processed in scene
        if (this.scene.onKeyUp(event))
            d3.event.stopPropagation();
    },

    // ------- help functions -----------
    getContainerSize: function () {
        var el = document.getElementById(this.containerId);
        return [el.clientWidth, el.clientHeight];
    }


}

var SCgEditMode = {
    SCgModeSelect: 0,
    SCgModeEdge: 1,
    SCgModeBus: 2,
    SCgModeContour: 3,
    SCgModeLink: 4,

    /**
     * Check if specified mode is valid
     */
    isValid: function (mode) {
        return (mode >= this.SCgModeSelect) && (mode <= this.SCgModeContour);
    }
};

var clipScgText = "clipScgText";

var SCgModalMode = {
    SCgModalNone: 0,
    SCgModalIdtf: 1,
    SCgModalType: 2
};

var KeyCode = {
    Escape: 27,
    Enter: 13,
    Delete: 46,
    Key1: 49,
    Key2: 50,
    Key3: 51,
    Key4: 52,
    Key5: 53,
    KeyMinusFirefox: 173,
    KeyMinus: 189,
    KeyMinusNum: 109,
    KeyEqualFirefox: 61,
    KeyEqual: 187,
    KeyPlusNum: 107,
    A: 65,
    C: 67,
    I: 73,
    T: 84,
    V: 86,
    Z: 90
};

var SCgTypeEdgeNow = sc_type_arc_pos_const_perm;
var SCgTypeNodeNow = sc_type_node | sc_type_const;

SCg.Scene = function (options) {

    this.listener_array = [new SCgSelectListener(this),
        new SCgEdgeListener(this),
        new SCgBusListener(this),
        new SCgContourListener(this),
        new SCgLinkListener(this)];
    this.listener = this.listener_array[0];
    this.commandManager = new SCgCommandManager();
    this.render = options.render;
    this.edit = options.edit;
    this.nodes = [];
    this.links = [];
    this.edges = [];
    this.contours = [];
    this.buses = [];

    this.objects = Object.create(null);
    this.edit_mode = SCgEditMode.SCgModeSelect;

    // object, that placed under mouse
    this.pointed_object = null;
    // object, that was mouse pressed
    this.focused_object = null;

    // list of selected objects
    this.selected_objects = [];

    // drag line points
    this.drag_line_points = [];
    // points of selected line object
    this.line_points = [];

    // mouse position
    this.mouse_pos = new SCg.Vector3(0, 0, 0);

    // edge source and target
    this.edge_data = {source: null, target: null};

    // bus source
    this.bus_data = {source: null, end: null};

    // callback for selection changed
    this.event_selection_changed = null;
    // callback for modal state changes
    this.event_modal_changed = null;

    /* Flag to lock any edit operations
     * If this flag is true, then we doesn't need to process any editor operatons, because
     * in that moment shows modal dialog
     */
    this.modal = SCgModalMode.SCgModalNone;
};

SCg.Scene.prototype = {

    constructor: SCg.Scene,

    init: function () {
        this.layout_manager = new SCg.LayoutManager();
        this.layout_manager.init(this);
    },

    /**
     * Appends new sc.g-node to scene
     * @param {SCg.ModelNode} node Node to append
     */
    appendNode: function (node) {
        this.nodes.push(node);
        node.scene = this;
    },

    appendLink: function (link) {
        this.links.push(link);
        link.scene = this;
    },

    /**
     * Appends new sc.g-edge to scene
     * @param {SCg.ModelEdge} edge Edge to append
     */
    appendEdge: function (edge) {
        this.edges.push(edge);
        edge.scene = this;
    },

    /**
     * Append new sc.g-contour to scene
     * @param {SCg.ModelContour} contour Contour to append
     */
    appendContour: function (contour) {
        this.contours.push(contour);
        contour.scene = this;
    },

    /**
     * Append new sc.g-contour to scene
     * @param {SCg.ModelBus} bus Bus to append
     */
    appendBus: function (bus) {
        this.buses.push(bus);
        bus.scene = this;
    },

    appendObject: function (obj) {
        if (obj instanceof SCg.ModelNode) {
            this.appendNode(obj);
        } else if (obj instanceof SCg.ModelLink) {
            this.appendLink(obj);
        } else if (obj instanceof SCg.ModelEdge) {
            this.appendEdge(obj);
        } else if (obj instanceof SCg.ModelContour) {
            this.appendContour(obj);
        } else if (obj instanceof SCg.ModelBus) {
            this.appendBus(obj);
            obj.setSource(obj.source);
        }
    },

    /**
     * Remove object from scene.
     * @param {SCg.ModelObject} obj Object to remove
     */
    removeObject: function (obj) {
        var self = this;

        function remove_from_list(obj, list) {
            var idx = list.indexOf(obj);
            if (idx < 0) {
                SCgDebug.error("Can't find object for remove");
                return;
            }
            if (self.pointed_object == obj) {
                self.pointed_object = null;
            }
            list.splice(idx, 1);
        }

        if (obj instanceof SCg.ModelNode) {
            remove_from_list(obj, this.nodes);
        } else if (obj instanceof SCg.ModelLink) {
            remove_from_list(obj, this.links);
        } else if (obj instanceof SCg.ModelEdge) {
            remove_from_list(obj, this.edges);
        } else if (obj instanceof SCg.ModelContour) {
            remove_from_list(obj, this.contours);
        } else if (obj instanceof SCg.ModelBus) {
            remove_from_list(obj, this.buses);
            obj.destroy();
        }
    },

    // --------- objects destroy -------

    /**
     * Delete objects from scene
     * @param {Array} objects Array of sc.g-objects to delete
     */
    deleteObjects: function (objects) {
        var self = this;

        function collect_objects(container, root) {
            if (container.indexOf(root) >= 0)
                return;

            container.push(root);
            for (idx in root.edges) {
                if (self.edges.indexOf(root.edges[idx]) > -1) collect_objects(container, root.edges[idx]);
            }

            if (root.bus)
                if (self.buses.indexOf(root.bus) > -1) collect_objects(container, root.bus);

            if (root instanceof SCg.ModelContour) {
                for (var numberChildren = 0; numberChildren < root.childs.length; numberChildren++) {
                    if (self.nodes.indexOf(root.childs[numberChildren]) > -1) {
                        collect_objects(container, root.childs[numberChildren]);
                    }
                }
            }
        }

        // collect objects for remove
        var objs = [];

        // collect objects for deletion
        for (var idx in objects)
            collect_objects(objs, objects[idx]);

        this.commandManager.execute(new SCgCommandDeleteObjects(objs, this));

        this.updateRender();
    },

    /**
     * Updates render
     */
    updateRender: function () {
        this.render.update();
    },

    /**
     * Updates render objects state
     */
    updateObjectsVisual: function () {
        this.render.updateObjects();
    },

    // --------- layout --------
    layout: function () {
        this.layout_manager.doLayout();
        this.render.update();
    },

    onLayoutTick: function () {
    },

    /**
     * Returns size of container, where graph drawing
     */
    getContainerSize: function () {
        return this.render.getContainerSize();
    },

    /**
     * Return array that contains sc-addrs of all objects in scene
     */
    getScAddrs: function () {
        var keys = new Array();
        for (key in this.objects) {
            keys.push(key);
        }
        return keys;
    },

    /**
     * Return object by sc-addr
     * @param {String} addr sc-addr of object to find
     * @return If object founded, then return it; otherwise return null
     */
    getObjectByScAddr: function (addr) {
        if (Object.prototype.hasOwnProperty.call(this.objects, addr))
            return this.objects[addr];

        return null;
    },

    /**
     * Selection all object
     */
    selectAll: function () {
        var self = this;
        var allObjects = [this.nodes, this.edges, this.buses, this.contours, this.links];
        allObjects.forEach(function (setObjects) {
            setObjects.forEach(function (obj) {
                if (!obj.is_selected) {
                    self.selected_objects.push(obj);
                    obj._setSelected(true);
                }
            });
        });
        this.updateObjectsVisual();
        this._fireSelectionChanged();
    },

    /**
     * Append selection to object
     */
    appendSelection: function (obj) {
        if (obj.is_selected) {
            var idx = this.selected_objects.indexOf(obj);
            this.selected_objects.splice(idx, 1);
            obj._setSelected(false);
        } else {
            this.selected_objects.push(obj);
            obj._setSelected(true);
        }
        this.selectionChanged();
    },

    /**
     * Remove selection from object
     */
    removeSelection: function (obj) {

        var idx = this.selected_objects.indexOf(obj);

        if (idx == -1 || !obj.is_selected) {
            SCgDebug.error('Trying to remove selection from unselected object');
            return;
        }

        this.selected_objects.splice(idx, 1);
        obj._setSelected(false);

        this.selectionChanged();
    },

    /**
     * Clear selection list
     */
    clearSelection: function () {

        var need_event = this.selected_objects.length > 0;

        for (idx in this.selected_objects) {
            this.selected_objects[idx]._setSelected(false);
        }

        this.selected_objects.splice(0, this.selected_objects.length);

        if (need_event) this.selectionChanged();
    },

    selectionChanged: function () {
        this._fireSelectionChanged();

        this.line_points.splice(0, this.line_points.length);
        // if selected any of line objects, then create controls to control it
        if (this.selected_objects.length == 1) {
            var obj = this.selected_objects[0];

            if (obj instanceof SCg.ModelEdge || obj instanceof SCg.ModelBus || obj instanceof SCg.ModelContour) { /* @todo add contour and bus */
                for (idx in obj.points) {
                    this.line_points.push({pos: obj.points[idx], idx: idx});
                }
            }
        }

        this.updateObjectsVisual();
    },

    // -------- input processing -----------
    onMouseMove: function (x, y) {
        if (this.modal != SCgModalMode.SCgModalNone) return false; // do nothing
        else return this.listener.onMouseMove(x, y);
    },

    onMouseDown: function (x, y) {
        if (this.modal != SCgModalMode.SCgModalNone) return false; // do nothing
        else return this.listener.onMouseDown(x, y);
    },

    onMouseUp: function (x, y) {
        if (this.modal != SCgModalMode.SCgModalNone) return false; // do nothing
        if (!this.pointed_object) {
            this.clearSelection();
        }
        this.focused_object = null;
        return false;
    },

    onMouseDoubleClick: function (x, y) {
        if (this.modal != SCgModalMode.SCgModalNone) return false; // do nothing
        else this.listener.onMouseDoubleClick(x, y);
    },

    onMouseOverObject: function (obj) {
        if (this.modal != SCgModalMode.SCgModalNone) return false; // do nothing
        this.pointed_object = obj;
    },

    onMouseOutObject: function (obj) {
        if (this.modal != SCgModalMode.SCgModalNone) return false; // do nothing
        this.pointed_object = null;
    },

    onMouseDownObject: function (obj) {
        if (this.modal != SCgModalMode.SCgModalNone) return false; // do nothing
        else this.listener.onMouseDownObject(obj);
    },

    onMouseUpObject: function (obj) {
        return this.listener.onMouseUpObject(obj);
    },

    onKeyDown: function (event) {
        if (this.modal == SCgModalMode.SCgModalNone && !$("#search-input").is(":focus")) {
            if ((event.which == KeyCode.Z) && event.ctrlKey && event.shiftKey) {
                this.commandManager.redo();
                this.updateRender();
            } else if (event.ctrlKey && (event.which == KeyCode.Z)) {
                this.commandManager.undo();
                this.updateRender();
            } else if (event.ctrlKey && (event.which == KeyCode.C)) {
                localStorage.setItem(clipScgText, GwfFileCreate.createFileWithSelectedObject(this));
            } else if (event.ctrlKey && (event.which == KeyCode.V)) {
                if (localStorage.getItem(clipScgText) !== null) {
                    ScgObjectBuilder.scene = this;
                    this.clearSelection();
                    GwfFileLoader.loadFromText(localStorage.getItem(clipScgText), this.render);
                }
            } else if ((event.which == KeyCode.A) && event.ctrlKey) {
                this.selectAll();
            } else if (event.which == KeyCode.Key1) {
                this.edit.toolSelect().click()
            } else if (event.which == KeyCode.Key2) {
                this.edit.toolEdge().click()
            } else if (event.which == KeyCode.Key3) {
                this.edit.toolBus().click()
            } else if (event.which == KeyCode.Key4) {
                this.edit.toolContour().click()
            } else if (event.which == KeyCode.Key5) {
                this.edit.toolLink().click()
            } else if (event.which == KeyCode.Delete) {
                this.edit.toolDelete().click();
            } else if (event.which == KeyCode.I) {
                if (!this.edit.toolChangeIdtf().hasClass("hidden"))
                    this.edit.toolChangeIdtf().click();
            } else if (event.which == KeyCode.C) {
                if (!this.edit.toolSetContent().hasClass("hidden"))
                    this.edit.toolSetContent().click();
            } else if (event.which == KeyCode.T) {
                if (!this.edit.toolChangeType().hasClass("hidden"))
                    this.edit.toolChangeType().click();
            } else if (event.which == KeyCode.KeyMinusFirefox || event.which == KeyCode.KeyMinus ||
                event.which == KeyCode.KeyMinusNum) {
                this.edit.toolZoomOut().click();
            } else if (event.which == KeyCode.KeyEqualFirefox || event.which == KeyCode.KeyEqual ||
                event.which == KeyCode.KeyPlusNum) {
                this.edit.toolZoomIn().click();
            } else {
                this.listener.onKeyDown(event);
            }
        }
        return false;
    },

    onKeyUp: function (event) {
        if (this.modal == SCgModalMode.SCgModalNone && !$("#search-input").is(":focus")) {
            this.listener.onKeyUp(event);
        }
        return false;
    },

    // -------- edit --------------
    /**
     * Setup new edit mode for scene. Calls from user interface
     * @param {SCgEditMode} mode New edit mode
     */
    setEditMode: function (mode) {

        if (this.edit_mode == mode) return; // do nothing

        this.edit_mode = mode;
        this.listener = this.listener_array[mode];

        this.focused_object = null;
        this.edge_data.source = null;
        this.edge_data.target = null;

        this.bus_data.source = null;

        this.resetEdgeMode();
    },

    /**
     * Changes modal state of scene. Just for internal usage
     */
    setModal: function (value) {
        this.modal = value;
        this._fireModalChanged();
    },

    /**
     * Reset edge creation mode state
     */
    resetEdgeMode: function () {
        this.drag_line_points.splice(0, this.drag_line_points.length);
        this.render.updateDragLine();

        this.edge_data.source = this.edge_data.target = null;
    },

    /**
     * Revert drag line to specified point. All drag point with index >= idx will be removed
     * @param {Integer} idx Index of drag point to revert.
     */
    revertDragPoint: function (idx) {

        if (this.edit_mode != SCgEditMode.SCgModeEdge && this.edit_mode != SCgEditMode.SCgModeBus && this.edit_mode != SCgEditMode.SCgModeContour) {
            SCgDebug.error('Work with drag point in incorrect edit mode');
            return;
        }

        this.drag_line_points.splice(idx, this.drag_line_points.length - idx);

        if (this.drag_line_points.length >= 2)
            this.bus_data.end = this.drag_line_points[this.drag_line_points.length - 1];
        else
            this.bus_data.end = null;

        if (this.drag_line_points.length == 0) {
            this.edge_data.source = this.edge_data.target = null;
            this.bus_data.source = null;
        }
        this.render.updateDragLine();
    },

    /**
     * Update selected line point position
     */
    setLinePointPos: function (idx, pos) {
        if (this.selected_objects.length != 1) {
            SCgDebug.error('Invalid state. Trying to update line point position, when there are no selected objects');
            return;
        }

        var edge = this.selected_objects[0];
        if (!(edge instanceof SCg.ModelEdge) && !(edge instanceof SCg.ModelBus) && !(edge instanceof SCg.ModelContour)) {
            SCgDebug.error("Unknown type of selected object");
            return;
        }

        if (edge.points.length <= idx) {
            SCgDebug.error('Invalid index of line point');
            return;
        }
        edge.points[idx].x = pos.x;
        edge.points[idx].y = pos.y;

        edge.requestUpdate();
        edge.need_update = true;
        edge.need_observer_sync = true;

        this.updateObjectsVisual();
    },

    // ------------- events -------------
    _fireSelectionChanged: function () {
        if (this.event_selection_changed)
            this.event_selection_changed();
    },

    _fireModalChanged: function () {
        if (this.event_modal_changed)
            this.event_modal_changed();
    },

    isSelectedObjectAllArcsOrAllNodes: function () {
        var objects = this.selected_objects;
        var typeMask = objects[0].sc_type & sc_type_arc_mask ? sc_type_arc_mask :
            objects[0].sc_type & sc_type_node ?
                sc_type_node : 0;
        return (objects.every(function (obj) {
            return ((obj.sc_type & typeMask) && !(obj instanceof SCg.ModelContour) && !(obj instanceof SCg.ModelBus));
        }))
    },

    isSelectedObjectAllHaveScAddr: function () {
        return (this.selected_objects.some(function (obj) {
            return obj.sc_addr;
        }))
    }
};

var SCgLayoutObjectType = {
    Node: 0,
    Edge: 1,
    Link: 2,
    Contour: 3,
    DotPoint: 4
};

// Layout algorithms


/**
 * Base layout algorithm
 */
SCg.LayoutAlgorithm = function (nodes, edges, contours, onTickUpdate) {
    this.nodes = nodes;
    this.edges = edges;
    this.contours = contours;
    this.onTickUpdate = onTickUpdate;
};

SCg.LayoutAlgorithm.prototype = {
    constructor: SCg.LayoutAlgorithm
};

// --------------------------

SCg.LayoutAlgorithmForceBased = function (nodes, edges, contours, onTickUpdate, rect) {
    SCg.LayoutAlgorithm.call(this, nodes, edges, contours, onTickUpdate);
    this.rect = rect;
};

SCg.LayoutAlgorithmForceBased.prototype = Object.create(SCg.LayoutAlgorithm);

SCg.LayoutAlgorithmForceBased.prototype.destroy = function () {
    this.stop();
};

SCg.LayoutAlgorithmForceBased.prototype.stop = function () {
    if (this.force) {
        this.force.stop();
        delete this.force;
        this.force = null;
    }

};

SCg.LayoutAlgorithmForceBased.prototype.start = function () {

    this.stop();

    // init D3 force layout
    var self = this;


    this.force = d3.layout.force()
        .nodes(this.nodes)
        .links(this.edges)
        .size(this.rect)
        .friction(0.9)
        .gravity(0.03)
        .linkDistance(function (edge) {

            var p1 = edge.source.object.getConnectionPos(edge.target.object.position, edge.object.source_dot);
            var p2 = edge.target.object.getConnectionPos(edge.source.object.position, edge.object.target_dot);
            var cd = edge.source.object.position.clone().sub(edge.target.object.position).length();
            var d = cd - p1.sub(p2).length();

            if (edge.source.type == SCgLayoutObjectType.DotPoint ||
                edge.target.type == SCgLayoutObjectType.DotPoint) {
                return d + 50;
            }

            return 100 + d;
        })
        .linkStrength(function (edge) {
            if (edge.source.type == SCgLayoutObjectType.DotPoint ||
                edge.target.type == SCgLayoutObjectType.DotPoint) {
                return 1;
            }

            return 0.3;
        })
        .charge(function (node) {
            if (node.type == SCgLayoutObjectType.DotPoint) {
                return 0;
            } else if (node.type == SCgLayoutObjectType.Link) {
                return -900;
            }

            return -700;
        })
        .on('tick', function () {
            self.onLayoutTick();
        })
        .start();
};

SCg.LayoutAlgorithmForceBased.prototype.onLayoutTick = function () {

    var dots = [];
    for (idx in this.nodes) {
        var node_layout = this.nodes[idx];

        if (node_layout.type === SCgLayoutObjectType.Node) {
            node_layout.object.setPosition(new SCg.Vector3(node_layout.x, node_layout.y, 0));
        } else if (node_layout.type === SCgLayoutObjectType.Link) {
            node_layout.object.setPosition(new SCg.Vector3(node_layout.x, node_layout.y, 0));
        } else if (node_layout.type === SCgLayoutObjectType.DotPoint) {
            dots.push(node_layout);
        } else if (node_layout.type === SCgLayoutObjectType.Contour) {
            node_layout.object.setPosition(new SCg.Vector3(node_layout.x, node_layout.y, 0));
        }
    }

    // setup dot points positions 
    for (idx in dots) {
        var dot = dots[idx];

        var edge = dot.object.target;
        if (dot.source)
            edge = dot.object.source;

        dot.x = edge.position.x;
        dot.y = edge.position.y;
    }

    this.onTickUpdate();
};


// ------------------------------------

SCg.LayoutManager = function () {

};

SCg.LayoutManager.prototype = {
    constructor: SCg.LayoutManager
};

SCg.LayoutManager.prototype.init = function (scene) {
    this.scene = scene;
    this.nodes = null;
    this.edges = null;

    this.algorithm = null;
};

/**
 * Prepare objects for layout
 */
SCg.LayoutManager.prototype.prepareObjects = function () {

    this.nodes = new Array();
    this.edges = new Array();
    var objDict = {};

    // first of all we need to collect objects from scene, and build them representation for layout
    for (idx in this.scene.nodes) {
        var node = this.scene.nodes[idx];
        if (node.contour)
            continue;

        var obj = new Object();

        obj.x = node.position.x;
        obj.y = node.position.y;
        obj.object = node;
        obj.type = SCgLayoutObjectType.Node;

        objDict[node.id] = obj;
        this.nodes.push(obj);
    }

    for (idx in this.scene.links) {
        var link = this.scene.links[idx];
        if (link.contour)
            continue;

        var obj = new Object();

        obj.x = link.position.x;
        obj.y = link.position.y;
        obj.object = link;
        obj.type = SCgLayoutObjectType.Link;

        objDict[link.id] = obj;
        this.nodes.push(obj);
    }

    for (idx in this.scene.edges) {
        var edge = this.scene.edges[idx];
        if (edge.contour)
            continue;

        var obj = new Object();

        obj.object = edge;
        obj.type = SCgLayoutObjectType.Edge;

        objDict[edge.id] = obj;
        this.edges.push(obj);
    }

    for (idx in this.scene.contours) {
        var contour = this.scene.contours[idx];
        if (contour.contour)
            continue;

        var obj = new Object();

        obj.x = contour.position.x;
        obj.y = contour.position.y;
        obj.object = contour;
        obj.type = SCgLayoutObjectType.Contour;

        objDict[contour.id] = obj;
        this.nodes.push(obj);
    }

    // store begin and end for edges
    for (idx in this.edges) {
        edge = this.edges[idx];

        source = objDict[edge.object.source.id];
        target = objDict[edge.object.target.id];

        function getEdgeObj(srcObj, isSource) {
            if (srcObj.type == SCgLayoutObjectType.Edge) {
                var obj = new Object();
                obj.type = SCgLayoutObjectType.DotPoint;
                obj.object = srcObj.object;
                obj.source = isSource;

                return obj;
            }
            return srcObj;
        };

        edge.source = getEdgeObj(source, true);
        edge.target = getEdgeObj(target, false);

        if (edge.source != source)
            this.nodes.push(edge.source);
        if (edge.target != target)
            this.nodes.push(edge.target);
    }

};

/**
 * Starts layout in scene
 */
SCg.LayoutManager.prototype.doLayout = function () {

    if (this.algorithm) {
        this.algorithm.stop();
        delete this.algorithm;
    }

    this.prepareObjects();
    this.algorithm = new SCg.LayoutAlgorithmForceBased(this.nodes, this.edges, null,
        $.proxy(this.onTickUpdate, this),
        this.scene.getContainerSize());
    this.algorithm.start();
};

SCg.LayoutManager.prototype.onTickUpdate = function () {
    this.scene.updateObjectsVisual();
    this.scene.pointed_object = null;
};

SCg.Tree = function () {
    this.triples = [];
    this.root = new SCg.TreeNode();
};

SCg.Tree.prototype = {
    constructor: SCg.Tree,

    build: function (triples) {

        this.triples = [];
        this.triples = this.triples.concat(triples);

        // determine possible contours
        var contours = {};
        for (t in this.triples) {
            var tpl = this.triples[t];

            if (tpl[0].type & sc_type_node_struct)
                contours[tpl[0].addr] = {el: tpl[0], childs: []};
        }

        // collect contour elements
        var parentsDict = {};
        for (t in this.triples) {
            var tpl = this.triples[t];

            if (tpl.ignore) continue;

            for (c in contours) {
                if ((c == tpl[0].addr) && (tpl[1].type & sc_type_arc_pos_const_perm)) {
                    contours[c].childs.push(tpl[2]);
                    tpl.ignore = true;
                    parentsDict[tpl[2].addr] = c;
                    break;
                }
            }
        }
    },

    /*!
     * Build construction in \p scene
     */
    output: function (scene) {

    }
};


// ----------------------------------
SCg.TreeNode = function () {
    this.childs = [];
    this.parent = null;
};

SCg.TreeNode.prototype = {

    appendChild: function (child) {
        if (child.parent)
            child.parent.removeChild(child);

        if (SCgDebug.eanbled && this.hasChild(child))
            SCgDebug.error("Duplicate child item");

        this.childs.push(child);
    },

    removeChild: function (child) {
        if (child.parent != this)
            SCgDebug.error("Item not found");

        var idx = this.childs.indexOf(child);
        if (idx >= 0)
            this.childs.splice(idx, 1);

        child.parent = null;
    },

    hasChild: function (child) {
        return this.childs.indexOf(child);
    }

};

function ScgFromScImpl(_sandbox, _editor, aMapping) {

    var self = this,
        arcMapping = aMapping,
        tasks = [],
        timeout = 0,
        batch = null,
        tasksLength = 0,
        editor = _editor,
        sandbox = _sandbox;

    function resolveIdtf(addr, obj) {
        sandbox.getIdentifier(addr, function (idtf) {
            obj.setText(idtf);
        });
    }

    function randomPos() {
        return new SCg.Vector3(100 * Math.random(), 100 * Math.random(), 0);
    }

    var doBatch = function () {

        if (!batch) {
            if (!tasks.length || tasksLength === tasks.length) {
                window.clearInterval(self.timeout);
                self.timeout = 0;
                return;
            }
            batch = tasks.splice(0, Math.max(150, tasks.length));
            tasksLength = tasks.length;
        }
        if (batch) {

            taskDoneCount = 0;
            for (var i = 0; i < batch.length; ++i) {
                var task = batch[i];
                var addr = task[0];
                var type = task[1];

                if (editor.scene.getObjectByScAddr(addr))
                    continue;

                if (type & sc_type_node) {
                    var model_node = SCg.Creator.createNode(type, randomPos(), '');
                    editor.scene.appendNode(model_node);
                    editor.scene.objects[addr] = model_node;
                    model_node.setScAddr(addr);
                    model_node.setObjectState(SCgObjectState.FromMemory);
                    resolveIdtf(addr, model_node);
                } else if (type & sc_type_arc_mask) {
                    var bObj = editor.scene.getObjectByScAddr(task[2]);
                    var eObj = editor.scene.getObjectByScAddr(task[3]);
                    if (!bObj || !eObj) {
                        tasks.push(task);
                    } else {
                        var model_edge = SCg.Creator.createEdge(bObj, eObj, type);
                        editor.scene.appendEdge(model_edge);
                        editor.scene.objects[addr] = model_edge;
                        model_edge.setScAddr(addr);
                        model_edge.setObjectState(SCgObjectState.FromMemory);
                        resolveIdtf(addr, model_edge);
                    }
                } else if (type & sc_type_link) {
                    var containerId = 'scg-window-' + sandbox.addr + '-' + addr + '-' + new Date().getUTCMilliseconds();
                    var model_link = SCg.Creator.createLink(randomPos(), containerId);
                    editor.scene.appendLink(model_link);
                    editor.scene.objects[addr] = model_link;
                    model_link.setScAddr(addr);
                    model_link.setObjectState(SCgObjectState.FromMemory);
                }

            }

            editor.render.update();
            editor.scene.layout();

            batch = null;
        }
    };

    var addTask = function (args) {
        tasks.push(args);
        if (!self.timeout) {
            self.timeout = window.setInterval(doBatch, 10);
        }
        doBatch();
    };

    var removeElement = function (addr) {
        var obj = editor.scene.getObjectByScAddr(addr);
        if (obj)
            editor.scene.deleteObjects([obj]);
        editor.render.update();
        editor.scene.layout();
    };

    let getArc = async (arc) => {
        let scTemplate = new sc.ScTemplate();
        scTemplate.triple(
            [sc.ScType.Unknown, "src"],
            new sc.ScAddr(arc),
            [sc.ScType.Unknown, "target"]
        );
        let result = await scClient.templateSearch(scTemplate);
        return [result[0].get("src").value, result[0].get("target").value];
    };

    let getElementType = async (el) => {
        return (await scClient.checkElements([new sc.ScAddr(el)]))[0].value;
    };

    return {
        update: async function (added, element, arc) {

            if (added) {
                let [_, el] = await getArc(arc);
                let t = await getElementType(el);
                arcMapping[arc] = el;
                if (t & (sc_type_node | sc_type_link)) {
                    addTask([el, t]);
                } else if (t & sc_type_arc_mask) {
                    let [src, target] = await getArc(el);
                    addTask([el, t, src, target]);
                } else
                    throw "Unknown element type " + t;
            } else {
                var e = arcMapping[arc];
                if (e)
                    removeElement(e);
            }
        }
    };

}

// ----------------------------------------------------------------------

//! TODO: refactoring
function scgScStructTranslator(_editor, _sandbox) {
    var r, editor = _editor,
        sandbox = _sandbox,
        tasks = [],
        processBatch = false,
        taskDoneCount = 0,
        arcMapping = {};

    if (!sandbox.is_struct)
        throw "Sandbox must to work with sc-struct";

    var scgFromSc = new ScgFromScImpl(sandbox, editor, arcMapping);

    var appendToConstruction = async function (obj) {
        let scTemplate = new sc.ScTemplate();
        scTemplate.triple(
            new sc.ScAddr(sandbox.addr),
            [sc.ScType.EdgeAccessVarPosPerm, 'arc'],
            new sc.ScAddr(obj.sc_addr)
        );
        let result = await scClient.templateGenerate(scTemplate);
        arcMapping[result.get('arc').value] = obj;
    };

    var currentLanguage = sandbox.getCurrentLanguage();
    var translateIdentifier = async function (obj) {
        if (currentLanguage) {
            let scTemplate = new sc.ScTemplate();
            scTemplate.tripleWithRelation(
                new sc.ScAddr(obj.sc_addr),
                sc.ScType.EdgeDCommonVar,
                [sc.ScType.LinkVar, 'link'],
                sc.ScType.EdgeAccessVarPosPerm,
                new sc.ScAddr(window.scKeynodes['nrel_main_idtf'])
            );
            scTemplate.triple(
                new sc.ScAddr(currentLanguage),
                sc.ScType.EdgeAccessVarPosPerm,
                'link'
            );
            let result = await scClient.templateGenerate(scTemplate);
            let linkAddr = result.get('link');
            await scClient.setLinkContents([new sc.ScLinkContent(obj.text, sc.ScLinkContentType.String, linkAddr)]);
        } else {
            throw new Error();
        }
    };

    return r = {
        updateFromSc: function (added, element, arc) {
            scgFromSc.update(added, element, arc);
        },

        translateToSc: async function (callback) {
            if (!sandbox.is_struct)
                throw "Invalid state. Trying translate sc-link into sc-memory";

            editor.scene.commandManager.clear();
            var nodes = editor.scene.nodes.slice();
            var links = editor.scene.links.slice();
            var buses = editor.scene.buses.slice();
            var objects = [];


            var appendObjects = function () {
                Promise.all(objects.map(appendToConstruction))
                    .then(() => callback(true))
                    .catch(() => callback(false));
            };

            function fireCallback() {
                editor.render.update();
                editor.scene.layout();
                appendObjects();
            }


            /// --------------------
            var translateNodes = async function () {
                var implFunc = async function (node) {
                    if (!node.sc_addr) {
                        let scConstruction = new sc.ScConstruction();
                        scConstruction.createNode(new sc.ScType(node.sc_type), "node");
                        let result = await scClient.createElements(scConstruction);
                        node.setScAddr(result[scConstruction.getIndex("node")].value);
                        node.setObjectState(SCgObjectState.NewInMemory);
                        objects.push(node);
                        if (node.text) {
                            await translateIdentifier(node);
                        }
                    }
                }
                return Promise.all(nodes.map(implFunc));
            }

            var preTranslateContoursAndBus = async function () {
                // create sc-struct nodes
                var scAddrGen = async function (c) {
                    if (c.sc_addr)
                        return;
                    let scConstruction = new sc.ScConstruction();
                    scConstruction.createNode(sc.ScType.NodeStruct, 'node');
                    let result = await scClient.createElements(scConstruction);
                    let node = result[scConstruction.getIndex('node')].value;
                    c.setScAddr(node);
                    c.setObjectState(SCgObjectState.NewInMemory);
                    objects.push(c);
                    if (c.text) {
                        await translateIdentifier(c);
                    }
                };
                var funcs = [];
                for (var i = 0; i < editor.scene.contours.length; ++i) {
                    editor.scene.contours[i].addNodesWhichAreInContourPolygon(editor.scene.nodes);
                    editor.scene.contours[i].addNodesWhichAreInContourPolygon(editor.scene.links);
                    editor.scene.contours[i].addEdgesWhichAreInContourPolygon(editor.scene.edges);
                    funcs.push(scAddrGen(editor.scene.contours[i]));
                }

                for (var number_bus = 0; number_bus < buses.length; ++number_bus) {
                    buses[number_bus].setScAddr(buses[number_bus].source.sc_addr);
                }

                // run tasks
                return Promise.all(funcs);
            }

            /// --------------------
            var translateEdges = function () {
                return new Promise((resolve, reject) => {
                    // translate edges
                    var edges = [];
                    editor.scene.edges.map(function (e) {
                        if (!e.sc_addr)
                            edges.push(e);
                    });

                    var edgesNew = [];
                    var translatedCount = 0;

                    async function doIteration() {
                        var edge = edges.shift();

                        function nextIteration() {
                            if (edges.length === 0) {
                                if (translatedCount === 0 || (edges.length === 0 && edgesNew.length === 0))
                                    resolve();
                                else {
                                    edges = edgesNew;
                                    edgesNew = [];
                                    translatedCount = 0;
                                    window.setTimeout(doIteration, 0);
                                }
                            } else
                                window.setTimeout(doIteration, 0);
                        }

                        if (edge.sc_addr)
                            reject("Edge already have sc-addr");

                        var src = edge.source.sc_addr;
                        var trg = edge.target.sc_addr;

                        if (src && trg) {
                            let scConstruction = new sc.ScConstruction();
                            scConstruction.createEdge(new sc.ScType(edge.sc_type), new sc.ScAddr(src), new sc.ScAddr(trg), 'edge');
                            let result = await scClient.createElements(scConstruction);
                            edge.setScAddr(result[scConstruction.getIndex('edge')].value);
                            edge.setObjectState(SCgObjectState.NewInMemory);
                            objects.push(edge);
                            translatedCount++;
                            nextIteration();
                        } else {
                            edgesNew.push(edge);
                            nextIteration();
                        }

                    }

                    if (edges.length > 0)
                        window.setTimeout(doIteration, 0);
                    else
                        resolve();

                });
            }

            var translateContours = async function () {
                // now need to process arcs from countours to child elements
                var arcGen = async function (contour, child) {
                    let edgeExist = await scHelper.checkEdge(contour.sc_addr, sc_type_arc_pos_const_perm, child.sc_addr);
                    if (!edgeExist) {
                        let scConstruction = new sc.ScConstruction();
                        scConstruction.createEdge(sc.ScType.EdgeAccessConstPosPerm, new sc.ScAddr(contour.sc_addr), new sc.ScAddr(child.sc_addr), 'edge');
                        await scClient.createElements(scConstruction);
                    }
                };

                var acrFuncs = [];
                for (var i = 0; i < editor.scene.contours.length; ++i) {
                    var c = editor.scene.contours[i];
                    for (var j = 0; j < c.childs.length; ++j) {
                        acrFuncs.push(arcGen(c, c.childs[j]));
                    }
                }
                return Promise.all(acrFuncs);
            }

            /// --------------------
            var translateLinks = async function () {
                var implFunc = async function (link) {
                    if (!link.sc_addr) {
                        let scConstruction = new sc.ScConstruction();
                        let data = '';
                        let type = 1;
                        var keynode = null;
                        if (link.contentType === 'float') {
                            data = link.content;
                            keynode = window.scKeynodes['binary_float'];
                            type = sc.ScLinkContentType.Float;
                        } else if (link.contentType === 'int8') {
                            data = link.content;
                            type = sc.ScLinkContentType.Int;
                            keynode = window.scKeynodes['binary_int8'];
                        } else if (link.contentType === 'int16') {
                            data = link.content;
                            type = sc.ScLinkContentType.Int;
                            keynode = window.scKeynodes['binary_int16'];
                        } else if (link.contentType === 'int32') {
                            data = link.content;
                            type = sc.ScLinkContentType.Int;
                            keynode = window.scKeynodes['binary_int32'];
                        } else if (link.contentType === 'image') {
                            data = link.fileReaderResult;
                            type = sc.ScLinkContentType.Binary;
                            keynode = window.scKeynodes['format_png'];
                        } else if (link.contentType === 'html') {
                            data = link.fileReaderResult;
                            type = sc.ScLinkContentType.String;
                            keynode = window.scKeynodes['format_html'];
                        } else if (link.contentType === 'pdf') {
                            data = link.fileReaderResult;
                            type = sc.ScLinkContentType.String;
                            keynode = window.scKeynodes['format_pdf'];
                        }
                        let scLinkContent = new sc.ScLinkContent(data, type);
                        scConstruction.createLink(sc.ScType.LinkConst, scLinkContent, 'link');
                        let result = await scClient.createElements(scConstruction);
                        let linkAddr = result[scConstruction.getIndex('link')].value;
                        link.setScAddr(linkAddr);
                        link.setObjectState(SCgObjectState.NewInMemory);
                        objects.push(link);
                        if (link.fileReaderResult) {
                            await scHelper.setLinkFormat(linkAddr, keynode);
                        } else {
                            let scTemplate = new sc.ScTemplate();
                            scTemplate.triple(
                                new sc.ScAddr(keynode),
                                sc.ScType.EdgeAccessVarPosPerm,
                                new sc.ScAddr(linkAddr)
                            );
                            await scClient.templateGenerate(scTemplate);
                        }
                    }
                }

                var funcs = [];
                for (let i = 0; i < links.length; ++i) {
                    funcs.push(implFunc(links[i]));
                }
                return Promise.all(funcs);
            }

            await translateNodes();
            await translateLinks();
            await preTranslateContoursAndBus();
            await translateEdges();
            await translateContours();
            fireCallback();
        }
    };
}

SCg.Creator = {};

/**
 * Create new node
 * @param {Integer} sc_type Type of node
 * @param {SCg.Vector3} pos Position of node
 * @param {String} text Text assotiated with node
 *
 * @return SCg.ModelNode created node
 */
SCg.Creator.createNode = function (sc_type, pos, text) {
    return new SCg.ModelNode({
        position: pos.clone(),
        scale: new SCg.Vector2(20, 20),
        sc_type: sc_type,
        text: text
    });
};

SCg.Creator.createLink = function (pos, containerId) {
    var link = new SCg.ModelLink({
        position: pos.clone(),
        scale: new SCg.Vector2(50, 50),
        sc_type: sc_type_link,
        containerId: containerId
    });
    link.setContent("");
    return link;
};

/**
 * Create edge between two specified objects
 * @param {SCg.ModelObject} source Edge source object
 * @param {SCg.ModelObject} target Edge target object
 * @param {Integer} sc_type SC-type of edge
 *
 * @return SCg.ModelEdge created edge
 */
SCg.Creator.createEdge = function (source, target, sc_type) {
    return new SCg.ModelEdge({
        source: source,
        target: target,
        sc_type: sc_type ? sc_type : sc_type_edge_common
    });
};

SCg.Creator.createBus = function (source) {
    return new SCg.ModelBus({
        source: source
    });
};

SCg.Creator.createCounter = function (polygon) {
    return new SCg.ModelContour({
        verticies: polygon
    });
};

SCgComponent = {
    ext_lang: 'scg_code',
    formats: ['format_scg_json'],
    struct_support: true,
    factory: function (sandbox) {
        return new scgViewerWindow(sandbox);
    }
};


/**
 * scgViewerWindow
 * @param config
 * @constructor
 */
var scgViewerWindow = function (sandbox) {

    this.domContainer = sandbox.container;
    this.sandbox = sandbox;
    this.tree = new SCg.Tree();
    this.editor = new SCg.Editor();

    var self = this;
    if (sandbox.is_struct) {
        this.scStructTranslator = new scgScStructTranslator(this.editor, this.sandbox);
    }

    const autocompletionVariants = function (keyword, callback) {
        window.scClient.getLinksContentsByContentSubstrings([keyword]).then((strings) => {
            const maxContentSize = 80;
            const keys = strings.length ? strings[0].filter((string) => string.length < maxContentSize) : [];
            callback(keys);
        });
    };

    this.editor.init(
        {
            sandbox: sandbox,
            containerId: sandbox.container,
            autocompletionVariants: autocompletionVariants,
            translateToSc: function (scene, callback) {
                return self.scStructTranslator.translateToSc(callback);
            },
            canEdit: this.sandbox.canEdit(),
            resolveControls: this.sandbox.resolveElementsAddr,
        }
    );


    this.receiveData = function (data) {
        var dfd = new jQuery.Deferred();

        /*this.collectTriples(data);
         this.tree.build(this.triples);*/
        this._buildGraph(data);

        dfd.resolve();
        return dfd.promise();
    };

    this.collectTriples = function (data) {

        this.triples = [];

        var elements = {};
        var edges = [];
        for (var i = 0; i < data.length; i++) {
            var el = data[i];

            elements[el.id] = el;
            if (el.el_type & sc_type_arc_mask) {
                edges.push(el);
            }
        }

        var founded = true;
        while (edges.length > 0 && founded) {
            founded = false;
            for (idx in edges) {
                var obj = edges[idx];
                var beginEl = elements[obj.begin];
                var endEl = elements[obj.end];

                // try to get begin and end object for arc
                if (beginEl && endEl) {
                    founded = true;
                    edges.splice(idx, 1);

                    this.triples.push([beginEl, {type: obj.el_type, addr: obj.id}, endEl]);
                }
            }
        }

        alert(this.triples.length);
    };

    this._buildGraph = function (data) {

        var elements = {};
        var edges = new Array();
        for (var i = 0; i < data.length; i++) {
            var el = data[i];

            if (elements.hasOwnProperty(el.id))
                continue;
            if (Object.prototype.hasOwnProperty.call(this.editor.scene.objects, el.id)) {
                elements[el.id] = this.editor.scene.objects[el.id];
                continue;
            }

            if (el.el_type & sc_type_node || el.el_type & sc_type_link) {
                var model_node = SCg.Creator.createNode(el.el_type, new SCg.Vector3(10 * Math.random(), 10 * Math.random(), 0), '');
                this.editor.scene.appendNode(model_node);
                this.editor.scene.objects[el.id] = model_node;
                model_node.setScAddr(el.id);
                model_node.setObjectState(SCgObjectState.FromMemory);
                elements[el.id] = model_node;
            } else if (el.el_type & sc_type_arc_mask) {
                edges.push(el);
            }
        }

        // create edges
        var founded = true;
        while (edges.length > 0 && founded) {
            founded = false;
            for (idx in edges) {
                var obj = edges[idx];
                var beginId = obj.begin;
                var endId = obj.end;
                // try to get begin and end object for arc
                if (elements.hasOwnProperty(beginId) && elements.hasOwnProperty(endId)) {
                    var beginNode = elements[beginId];
                    var endNode = elements[endId];
                    founded = true;
                    edges.splice(idx, 1);
                    var model_edge = SCg.Creator.createEdge(beginNode, endNode, obj.el_type);
                    this.editor.scene.appendEdge(model_edge);
                    this.editor.scene.objects[obj.id] = model_edge;
                    model_edge.setScAddr(obj.id);
                    model_edge.setObjectState(SCgObjectState.FromMemory);
                    elements[obj.id] = model_edge;
                }
            }
        }

        if (edges.length > 0)
            alert("error");

        this.editor.render.update();
        this.editor.scene.layout();
    };

    this.destroy = function () {
        delete this.editor;
        return true;
    };

    this.getObjectsToTranslate = function () {
        return this.editor.scene.getScAddrs();
    };

    this.applyTranslation = function (namesMap) {
        for (addr in namesMap) {
            var obj = this.editor.scene.getObjectByScAddr(addr);
            if (obj) {
                obj.text = namesMap[addr];
            }
        }
        this.editor.render.updateTexts();
    };


    this.eventStructUpdate = function () {
        self.scStructTranslator.updateFromSc.apply(self.scStructTranslator, arguments);
    };

    // delegate event handlers
    this.sandbox.eventDataAppend = $.proxy(this.receiveData, this);
    this.sandbox.eventGetObjectsToTranslate = $.proxy(this.getObjectsToTranslate, this);
    this.sandbox.eventApplyTranslation = $.proxy(this.applyTranslation, this);
    this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);

    this.sandbox.updateContent();
};


SCWeb.core.ComponentManager.appendComponentInitialize(SCgComponent);

SCgBusListener = function (scene) {
    this.scene = scene;
};

SCgBusListener.prototype = {

    constructor: SCgBusListener,

    onMouseMove: function (x, y) {
        this.scene.mouse_pos.x = x;
        this.scene.mouse_pos.y = y;
        this.scene.render.updateDragLine();
        return true;
    },

    onMouseDown: function (x, y) {
        if (!this.scene.pointed_object) {
            if (this.scene.bus_data.source) {
                this.scene.drag_line_points.push({x: x, y: y, idx: this.scene.drag_line_points.length});
                this.scene.bus_data.end = {x: x, y: y, idx: this.scene.drag_line_points.length};
                return true;
            }
        }
        return false;
    },

    onMouseDoubleClick: function (x, y) {
        return false;
    },

    onMouseDownObject: function (obj) {
        if (!this.scene.bus_data.source && !obj.bus && !(obj instanceof SCg.ModelBus)) {
            this.scene.bus_data.source = obj;
            this.scene.drag_line_points.push({
                x: this.scene.mouse_pos.x,
                y: this.scene.mouse_pos.y,
                idx: this.scene.drag_line_points.length
            });
            return true;
        } else {
            if (obj instanceof SCg.ModelContour) {
                var x = this.scene.mouse_pos.x;
                var y = this.scene.mouse_pos.y;
                this.scene.drag_line_points.push({x: x, y: y, idx: this.scene.drag_line_points.length});
                this.scene.bus_data.end = {x: x, y: y, idx: this.scene.drag_line_points.length};
                return true;
            }
        }
        return false;
    },

    onMouseUpObject: function (obj) {
        return true;
    },

    onKeyDown: function (event) {
        if (event.which == KeyCode.Escape) {
            this.scene.revertDragPoint(0);
            return true;
        }
        return false;
    },

    onKeyUp: function (event) {
        return false;
    },

    finishCreation: function () {
        this.scene.commandManager.execute(new SCgCommandCreateBus(this.scene.bus_data.source, this.scene));
    }

};

SCgContourListener = function (scene) {
    this.scene = scene;
};

SCgContourListener.prototype = {

    constructor: SCgContourListener,

    onMouseMove: function (x, y) {
        this.scene.mouse_pos.x = x;
        this.scene.mouse_pos.y = y;
        this.scene.render.updateDragLine();
        return true;
    },

    onMouseDown: function (x, y) {
        if (!this.scene.pointed_object) {
            this.scene.drag_line_points.push({x: x, y: y, idx: this.scene.drag_line_points.length});
            return true;
        }
        return false;
    },

    onMouseDoubleClick: function (x, y) {
        return false;
    },

    onMouseDownObject: function (obj) {
        return false;
    },

    onMouseUpObject: function (obj) {
        return true;
    },

    onKeyDown: function (event) {
        if (event.which == KeyCode.Escape) {
            this.scene.resetEdgeMode();
            return true;
        }
        return false;
    },

    onKeyUp: function (event) {
        return false;
    },

    finishCreation: function () {
        this.scene.commandManager.execute(new SCgCommandCreateContour(this.scene));
    }

};

SCgEdgeListener = function (scene) {
    this.scene = scene;
};

SCgEdgeListener.prototype = {

    constructor: SCgEdgeListener,

    onMouseMove: function (x, y) {
        this.scene.mouse_pos.x = x;
        this.scene.mouse_pos.y = y;
        this.scene.render.updateDragLine();
        return true;
    },

    onMouseDown: function (x, y) {
        if (!this.scene.pointed_object) {
            if (this.scene.edge_data.source) {
                this.scene.drag_line_points.push({x: x, y: y, idx: this.scene.drag_line_points.length});
                return true;
            }
        }
        return false;
    },

    onMouseDoubleClick: function (x, y) {
        return false;
    },

    onMouseDownObject: function (obj) {
        var scene = this.scene;
        if (!scene.edge_data.source) {
            scene.edge_data.source = obj;
            scene.drag_line_points.push({
                x: scene.mouse_pos.x,
                y: scene.mouse_pos.y,
                idx: scene.drag_line_points.length
            });
            return true;
        } else {
            // source and target must be not equal
            if (scene.edge_data.source != obj) {
                if (!(obj instanceof SCg.ModelContour && obj.isNodeInPolygon(scene.edge_data.source))) {
                    scene.commandManager.execute(new SCgCommandCreateEdge(scene.edge_data.source,
                        obj,
                        this.scene));
                    return true;
                } else {
                    scene.drag_line_points.push({
                        x: scene.mouse_pos.x,
                        y: scene.mouse_pos.y,
                        idx: scene.drag_line_points.length
                    });
                    return true;
                }
            } else {
                scene.edge_data.source = scene.edge_data.target = null;
                scene.drag_line_points.splice(0, scene.drag_line_points.length);
                scene.clearSelection();
                scene.appendSelection(obj);
            }
        }
        return false;
    },

    onMouseUpObject: function (obj) {
        return true;
    },

    onKeyDown: function (event) {
        if (event.which == KeyCode.Escape) {
            this.scene.revertDragPoint(0);
            return true;
        }
        return false;
    },

    onKeyUp: function (event) {
        return false;
    }

};

SCgLinkListener = function (scene) {
    this.scene = scene;
};

SCgLinkListener.prototype = {

    constructor: SCgLinkListener,

    onMouseMove: function (x, y) {
        return false;
    },

    onMouseDown: function (x, y) {
        return false;
    },

    onMouseDoubleClick: function (x, y) {
        if (this.scene.pointed_object && !(this.scene.pointed_object instanceof SCg.ModelContour)) {
            return false;
        }
        this.scene.commandManager.execute(new SCgCommandCreateLink(x, y, this.scene));
        return true;
    },

    onMouseDownObject: function (obj) {
        return false;
    },

    onMouseUpObject: function (obj) {
        return true;
    },

    onKeyDown: function (event) {
        return false;
    },

    onKeyUp: function (event) {
        return false;
    }

};
SCgSelectListener = function (scene) {
    this.scene = scene;
    this.position = null;
    this.offsetObject = null;
};

SCgSelectListener.prototype = {

    constructor: SCgSelectListener,

    selectObject: function (obj) {
        if (!d3.event.ctrlKey) this.scene.clearSelection();
        this.scene.appendSelection(obj);
        this.scene.updateObjectsVisual();
    },

    onMouseMove: function (x, y) {
        var self = this;
        var offset = new SCg.Vector3(x - this.scene.mouse_pos.x, y - this.scene.mouse_pos.y, 0);
        this.scene.mouse_pos.x = x;
        this.scene.mouse_pos.y = y;
        if (this.scene.focused_object) {
            this.scene.selected_objects.forEach(function (object) {
                if (!(object.contour != null && self.scene.selected_objects.indexOf(object.contour) > -1)) {
                    object.setPosition(object.position.clone().add(offset));
                }
            });
            this.scene.updateObjectsVisual();
            return true;
        }
        return false;
    },

    onMouseDown: function (x, y) {
        return false;
    },

    onMouseDoubleClick: function (x, y) {
        if (this.scene.pointed_object && !(this.scene.pointed_object instanceof SCg.ModelContour)) {
            return false;
        }
        this.scene.commandManager.execute(new SCgCommandCreateNode(x, y, this.scene));
        return true;
    },

    onMouseDownObject: function (obj) {
        this.offsetObject = obj;
        this.scene.focused_object = obj;
        this.position = this.scene.focused_object.position.clone();
        if (obj instanceof SCg.ModelContour || obj instanceof SCg.ModelBus) {
            obj.previousPoint = new SCg.Vector2(this.scene.mouse_pos.x, this.scene.mouse_pos.y);
        }
        if (d3.event.ctrlKey) {
            this.selectObject(obj);
            this.onMouseUpObject(obj); // do not move object after select with ctrl
        } else {
            if (this.scene.selected_objects.indexOf(obj) == -1) {
                this.selectObject(obj);
            }
        }
        return false;
    },

    onMouseUpObject: function (obj) {
        if (!this.scene.focused_object) return; // do nothing after select with ctrl
        var offset = new SCg.Vector3(this.position.x - this.scene.mouse_pos.x, this.position.y - this.scene.mouse_pos.y, 0);
        if (!this.position.equals(this.scene.focused_object.position) && this.offsetObject == obj) {
            var commands = [];
            var self = this;
            this.scene.selected_objects.forEach(function (object) {
                if (!(object.contour != null && self.scene.selected_objects.indexOf(object.contour) > -1)) {
                    commands.push(new SCgCommandMoveObject(object, offset));
                }
            });
            this.scene.commandManager.execute(new SCgWrapperCommand(commands), true);
            this.offsetObject = null;
            this.position = null;
        } else if (!d3.event.ctrlKey && obj == this.scene.focused_object && this.scene.selected_objects.length > 1) {
            this.selectObject(obj); // remove multi selection and select object
        }
        this.scene.focused_object = null;
        return true;
    },

    onKeyDown: function (event) {
        return false;
    },

    onKeyUp: function (event) {
        return false;
    }

};

SCgCommandAppendObject = function (object, scene) {
    this.object = object;
    this.scene = scene;
};

SCgCommandAppendObject.prototype = {

    constructor: SCgCommandAppendObject,


    undo: function () {
        if (this.object) {
            var idx = this.scene.selected_objects.indexOf(this.object);
            this.scene.selected_objects.splice(idx, 1);
            this.object._setSelected(false);
            this.scene.edit.onSelectionChanged();
            this.scene.line_points = [];
        }
        this.scene.removeObject(this.object);
    },

    execute: function () {
        this.scene.appendObject(this.object);
        this.object.update();
    }

};

SCgCommandManager = function () {
    this.listCommand = [];
    this.indexCommand = -1;
};

SCgCommandManager.prototype = {

    constructor: SCgCommandManager,

    execute: function (command, noNeedExecute) {
        this.destroyObject();
        this.listCommand = this.listCommand.slice(0, this.indexCommand + 1);
        this.listCommand.push(command);
        if (!noNeedExecute) command.execute();
        this.indexCommand++;
    },

    clear: function () {
        this.listCommand = [];
        this.indexCommand = -1;
    },

    destroyObject: function () {
        for (var numberObject = this.indexCommand + 1; numberObject < this.listCommand.length; numberObject++) {
            // TODO obj.destroy();
            delete this.listCommand[numberObject];
        }
    },

    undo: function () {
        if (this.indexCommand > -1) {
            this.listCommand[this.indexCommand].undo(this);
            this.indexCommand--;
        }
    },

    redo: function () {
        if (this.indexCommand < this.listCommand.length - 1) {
            this.indexCommand++;
            this.listCommand[this.indexCommand].execute();
        }
    }

};

SCgCommandCreateNode = function (x, y, scene) {
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.node = null;
};

SCgCommandCreateNode.prototype = {

    constructor: SCgCommandCreateNode,

    undo: function () {
        if (this.node.is_selected) {
            var idx = this.scene.selected_objects.indexOf(this.node);
            this.scene.selected_objects.splice(idx, 1);
            this.node._setSelected(false);
            this.scene.edit.onSelectionChanged();
        }
        this.scene.removeObject(this.node);
    },

    execute: function () {
        if (this.node == null) {
            this.node = SCg.Creator.createNode(SCgTypeNodeNow, new SCg.Vector3(this.x, this.y, 0), '');
            this.scene.appendNode(this.node);
            this.scene.updateRender();
            this.scene.clearSelection();
            this.scene.appendSelection(this.node);
        } else {
            this.scene.appendNode(this.node);
        }
    }

};

SCgCommandCreateEdge = function (source, target, scene) {
    this.source = source;
    this.target = target;
    this.scene = scene;
    this.edge = null;
};

SCgCommandCreateEdge.prototype = {

    constructor: SCgCommandCreateEdge,

    undo: function () {
        if (this.edge.is_selected) {
            var idx = this.scene.selected_objects.indexOf(this.edge);
            this.scene.selected_objects.splice(idx, 1);
            this.edge._setSelected(false);
            this.scene.edit.onSelectionChanged();
            this.scene.line_points = [];
        }
        this.scene.removeObject(this.edge);
    },

    execute: function () {
        var scene = this.scene;
        if (this.edge == null) {
            this.edge = SCg.Creator.createEdge(this.source, this.target, SCgTypeEdgeNow);
            scene.appendEdge(this.edge);
            var mouse_pos = new SCg.Vector2(scene.mouse_pos.x, scene.mouse_pos.y);
            var start_pos = new SCg.Vector2(scene.drag_line_points[0].x, scene.drag_line_points[0].y);
            this.edge.setSourceDot(this.source.calculateDotPos(start_pos));
            this.edge.setTargetDot(this.target.calculateDotPos(mouse_pos));
            if (scene.drag_line_points.length > 1) this.edge.setPoints(scene.drag_line_points.slice(1));
            scene.edge_data.source = scene.edge_data.target = null;
            scene.drag_line_points.splice(0, scene.drag_line_points.length);
            scene.updateRender();
            scene.render.updateDragLine();
            this.edge.need_update = true;
            scene.updateObjectsVisual();
            scene.clearSelection();
            scene.appendSelection(this.edge);
        } else {
            scene.appendEdge(this.edge);
            this.edge.update();
        }
    }

};

SCgCommandCreateBus = function (source, scene) {
    this.source = source;
    this.scene = scene;
    this.bus = null;
};

SCgCommandCreateBus.prototype = {

    constructor: SCgCommandCreateBus,

    undo: function () {
        if (this.bus.is_selected) {
            var idx = this.scene.selected_objects.indexOf(this.bus);
            this.scene.selected_objects.splice(idx, 1);
            this.bus._setSelected(false);
            this.scene.edit.onSelectionChanged();
            this.scene.line_points = [];
        }
        this.scene.removeObject(this.bus);
    },

    execute: function () {
        var scene = this.scene;
        if (this.bus == null) {
            this.bus = SCg.Creator.createBus(this.source);
            scene.appendBus(this.bus);
            if (scene.drag_line_points.length > 1) this.bus.setPoints(scene.drag_line_points.slice(1));
            var pos = new SCg.Vector2(scene.drag_line_points[0].x, scene.drag_line_points[0].y);
            this.bus.setSourceDot(this.source.calculateDotPos(pos));
            this.bus.setTargetDot(0);
            scene.bus_data.source = scene.bus_data.end = null;
            scene.drag_line_points.splice(0, scene.drag_line_points.length);
            scene.updateRender();
            scene.render.updateDragLine();
        } else {
            scene.appendBus(this.bus);
            this.bus.setSource(this.source);
            this.bus.update();
        }

    }

};

SCgCommandCreateContour = function (scene) {
    this.scene = scene;
    this.contour = null;
};

SCgCommandCreateContour.prototype = {

    constructor: SCgCommandCreateContour,

    undo: function () {
        if (this.contour.is_selected) {
            var idx = this.scene.selected_objects.indexOf(this.contour);
            this.scene.selected_objects.splice(idx, 1);
            this.contour._setSelected(false);
            this.scene.edit.onSelectionChanged();
            this.scene.line_points = [];
        }
        this.scene.removeObject(this.contour);
    },

    execute: function () {
        var scene = this.scene;
        if (this.contour == null) {
            var polygon = $.map(scene.drag_line_points, function (vertex) {
                return $.extend({}, vertex);
            });
            this.contour = SCg.Creator.createCounter(polygon);
            scene.appendContour(this.contour);
            scene.pointed_object = this.contour;
            scene.drag_line_points.splice(0, scene.drag_line_points.length);
            scene.updateRender();
            scene.render.updateDragLine();
            scene.clearSelection();
            scene.appendSelection(this.contour);
        } else {
            scene.appendContour(this.contour);
            this.contour.update();
        }

    }

};
SCgCommandCreateLink = function (x, y, scene) {
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.link = null;
};

SCgCommandCreateLink.prototype = {

    constructor: SCgCommandCreateLink,

    undo: function () {
        if (this.link.is_selected) {
            var idx = this.scene.selected_objects.indexOf(this.link);
            this.scene.selected_objects.splice(idx, 1);
            this.link._setSelected(false);
            this.scene.edit.onSelectionChanged();
        }
        this.scene.removeObject(this.link);
    },

    execute: function () {
        if (this.link == null) {
            this.link = SCg.Creator.createLink(new SCg.Vector3(this.x, this.y, 0), '');
            this.scene.appendLink(this.link);
            this.scene.updateRender();
            this.scene.clearSelection();
            this.scene.appendSelection(this.link);
        } else {
            this.scene.appendLink(this.link);
            this.link.update();
        }
    }

};

SCgCommandChangeIdtf = function (object, newIdtf) {
    this.object = object;
    this.oldIdtf = object.text;
    this.newIdtf = newIdtf;
};

SCgCommandChangeIdtf.prototype = {

    constructor: SCgCommandChangeIdtf,

    undo: function () {
        this.object.setText(this.oldIdtf);
    },

    execute: function () {
        this.object.setText(this.newIdtf);
    }

};

SCgCommandChangeContent = function (object, newContent, newType, newFileReaderResult) {
    this.object = object;
    this.oldContent = object.content;
    this.newContent = newContent;
    this.oldType = object.contentType;
    this.newType = newType;
    this.oldFileReaderResult = object.fileReaderResult;
    this.newFileReaderResult = newFileReaderResult;
};

SCgCommandChangeContent.prototype = {

    constructor: SCgCommandChangeContent,

    undo: function () {
        this.object.setContent(this.oldContent, this.oldType);
        this.object.fileReaderResult = this.oldFileReaderResult;
    },

    execute: function () {
        this.object.setContent(this.newContent, this.newType);
        this.object.fileReaderResult = this.newFileReaderResult;
    }

};

SCgCommandChangeType = function (object, newType) {
    this.object = object;
    this.oldType = object.sc_type;
    this.newType = newType;
};

SCgCommandChangeType.prototype = {

    constructor: SCgCommandChangeType,

    undo: function () {
        this.object.setScType(this.oldType);
    },

    execute: function () {
        this.object.setScType(this.newType);
    }

};

SCgCommandDeleteObjects = function (objects, scene) {
    this.objects = objects;
    this.scene = scene;
};

SCgCommandDeleteObjects.prototype = {

    constructor: SCgCommandDeleteObjects,

    undo: function () {
        for (var numberObject = 0; numberObject < this.objects.length; numberObject++) {
            this.scene.appendObject(this.objects[numberObject]);
            if (this.objects[numberObject].sc_addr)
                this.scene.objects[this.objects[numberObject].sc_addr] = this.objects[numberObject];
            this.objects[numberObject].update();
        }
    },

    execute: function () {
        for (var numberObject = 0; numberObject < this.objects.length; numberObject++) {
            this.scene.removeObject(this.objects[numberObject]);
            if (this.objects[numberObject].sc_addr)
                delete this.scene.objects[this.objects[numberObject].sc_addr];
        }
    }

};

SCgCommandMoveObject = function (object, offset) {
    this.object = object;
    this.offset = offset;
};

SCgCommandMoveObject.prototype = {

    constructor: SCgCommandMoveObject,

    undo: function () {
        this.object.setPosition(this.object.position.clone().add(this.offset));
    },

    execute: function () {
        this.object.setPosition(this.object.position.clone().sub(this.offset));
    }

};

SCgCommandMovePoint = function (object, oldPoints, newPoints, scene) {
    this.object = object;
    this.oldPoints = Array.from(oldPoints);
    this.newPoints = Array.from(newPoints);
    this.scene = scene;
};

SCgCommandMovePoint.prototype = {

    constructor: SCgCommandMovePoint,

    undo: function () {
        this.object.points = this.oldPoints;
        if (this.object.is_selected) this.scene.line_points = [];
        this.object.update();
    },

    execute: function () {
        this.object.points = this.newPoints;
        if (this.object.is_selected) this.scene.line_points = [];
        this.object.update();
    }

};

SCgCommandGetNodeFromMemory = function (object, newType, newIdtf, newScAddr, scene) {
    this.object = object;
    this.oldType = object.sc_type;
    this.newType = newType;
    this.oldIdtf = object.text;
    this.newIdtf = newIdtf;
    this.oldScAddr = object.sc_addr;
    this.newScAddr = newScAddr;
    this.scene = scene;
};

SCgCommandGetNodeFromMemory.prototype = {
    constructor: SCgCommandGetNodeFromMemory,

    undo: function () {
        this.object.setText(this.oldIdtf);
        this.object.setScType(this.oldType);
        if (this.oldScAddr != null) {
            this.object.setScAddr(this.oldScAddr, true);
        } else {
            this.object.sc_addr = null;
            this.object.state = SCgObjectState.Normal;
            delete this.scene.objects[this.sc_addr];
        }
    },

    execute: function () {
        this.object.setText(this.newIdtf);
        this.object.setScAddr(this.newScAddr, true);
        this.object.setScType(this.newType);
    }
};

SCgWrapperCommand = function (commands) {
    this.commands = commands;
};

SCgWrapperCommand.prototype = {

    constructor: SCgWrapperCommand,

    undo: function () {
        this.commands.forEach(function (command) {
            command.undo();
        });
    },

    execute: function () {
        this.commands.forEach(function (command) {
            command.execute();
        });
    }

};
