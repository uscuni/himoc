// https://observablehq.com/@d3/tree-of-life@146
function _1(md) {
  return (
    md``
  )
}

function _showLength(html) {
  const form = html`<form style="font: 12px var(--sans-serif); display: flex; flex-direction: column; justify-content: center; min-height: 33px;"><label style="display: flex; align-items: center;"><input type=checkbox name=i><span style="margin-left: 0.5em;">Show branch length</span>`;
  const timeout = setTimeout(() => {
    form.i.checked = true;
    form.i.onclick();
  }, 2000);
  form.i.onclick = () => {
    clearTimeout(timeout);
    form.value = form.i.checked;
    form.dispatchEvent(new CustomEvent("input"));
  };
  form.value = false;
  return form;
}


function _chart(d3, data, cluster, setRadius, innerRadius, maxLength, setColor, outerRadius, width, linkExtensionConstant, linkConstant, linkExtensionVariable, linkVariable) {
  const root = d3.hierarchy(data, d => d.branchset)
    .sum(d => d.branchset ? 0 : 1)
    .sort((a, b) => (a.value - b.value) || d3.ascending(a.data.length, b.data.length));

  cluster(root);
  setRadius(root, root.data.length = 0, innerRadius / maxLength(root));
  setColor(root);

  const svg = d3.create("svg")
    .attr("viewBox", [-outerRadius, -outerRadius, width, width])
    .attr("font-family", "sans-serif")
    .attr("font-size", 10);

  // Add background circle
  svg.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", outerRadius)
    .attr("fill", "#000000")
    .attr("opacity", 0.5);

  svg.append("style").text(`

.link--active {
  stroke: #fff !important;
  stroke-width: 4px;
}

.link-extension--active {
  stroke-opacity: .6;
}

.label--active {
  font-weight: bold;
}
`);

  const linkExtension = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-opacity", 0.25)
    .attr("stroke-width", 2)
    .selectAll("path")
    .data(root.links().filter(d => !d.target.children))
    .join("path")
    .each(function (d) { d.target.linkExtensionNode = this; })
    .attr("d", linkExtensionConstant);

  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .each(function (d) { d.target.linkNode = this; })
    .attr("d", linkConstant)
    .attr("stroke", d => d.target.color)
    .on("mouseover", mouseovered(true))
    .on("mouseout", mouseovered(false));

  link.on("mouseover", function (event, d) {
    const descendantLinks = new Set();
    function collectDescendants(node) {
      if (node.children) {
        node.children.forEach(child => {
          descendantLinks.add(child.linkNode);
          collectDescendants(child);
        });
      }
    }
    collectDescendants(d.target);
    d3.select(this).classed("link--active", true);
    descendantLinks.forEach(linkNode => {
      d3.select(linkNode).classed("link--active", true);
    });
    d3.select(d.target.linkExtensionNode).classed("link-extension--active", true);
  })
    .on("mouseout", function (event, d) {
      const descendantLinks = new Set();
      function collectDescendants(node) {
        if (node.children) {
          node.children.forEach(child => {
            descendantLinks.add(child.linkNode);
            collectDescendants(child);
          });
        }
      }
      collectDescendants(d.target);
      d3.select(this).classed("link--active", false);
      descendantLinks.forEach(linkNode => {
        d3.select(linkNode).classed("link--active", false);
      });
      d3.select(d.target.linkExtensionNode).classed("link-extension--active", false);
    });

    link.on("click", function(event, d) {
      const leafIds = [];
      function collectLeafIds(node) {
        if (!node.children) {
          leafIds.push(node.data.name);
        } else {
          node.children.forEach(collectLeafIds);
        }
      }
      collectLeafIds(d.target);
      console.log('Leaf IDs:', leafIds);
    });

  svg.append("g")
    .selectAll("text")
    .data(root.leaves())
    .join("text")
    .attr("dy", ".31em")
    .attr("transform", d => `rotate(${d.x - 90}) translate(${innerRadius + 4},0)${d.x < 180 ? "" : " rotate(180)"}`)
    .attr("text-anchor", d => d.x < 180 ? "start" : "end")
    .attr("fill", "white") // Added fill attribute
    .text(d => d.data.name.replace(/_/g, " "))
    .on("mouseover", mouseovered(true))
    .on("mouseout", mouseovered(false));

  function update(checked) {
    const t = d3.transition().duration(750);
    linkExtension.transition(t).attr("d", checked ? linkExtensionVariable : linkExtensionConstant);
    link.transition(t).attr("d", checked ? linkVariable : linkConstant);
  }

  function mouseovered(active) {
    return function (event, d) {
      d3.select(this).classed("label--active", active);
      d3.select(d.linkExtensionNode).classed("link-extension--active", active).raise();
      do d3.select(d.linkNode).classed("link--active", active).raise();
      while (d = d.parent);
    };
  }


  return Object.assign(svg.node(), { update });
}


function _update(chart, showLength) {
  return (
    chart.update(showLength)
  )
}

function _cluster(d3, innerRadius) {
  return (
    d3.cluster()
      .size([360, innerRadius])
      .separation((a, b) => 1)
  )
}

const uniqueColors = [
  "#1cae75",
  "#922800",
  "#6da2ff",
  "#38a6a5",
  "#94346e",
  "#73af48",
  "#1d6996",
  "#0f8554",
  "#354dbe",
  "#edad08",
  "#dba2ff",
  "#a65904",
  "#3d6100",
  "#aeb6ef",
  "#f79e8e",
  "#6f4070"
];

function _color(d3) {
  return (
    d3.scaleOrdinal()
      .domain(["132982", "132101", "130459", "123316", "117655", "115333", "114550", "114538", "113036", "101179", "92982", "82765", "77515", "77513", "77508", "76535"].reverse())
      .range(uniqueColors)
  )
}

function _maxLength(d3) {
  return (
    function maxLength(d) {
      return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
    }
  )
}

function _setRadius() {
  return (
    function setRadius(d, y0, k) {
      d.radius = (y0 += d.data.length) * k;
      if (d.children) d.children.forEach(d => setRadius(d, y0, k));
    }
  )
}

function _setColor(color) {
  return (
    function setColor(d) {
      var name = d.data.name;
      d.color = color.domain().indexOf(name) >= 0 ? color(name) : d.parent ? d.parent.color : null;
      if (d.children) d.children.forEach(setColor);
    }
  )
}

function _linkVariable(linkStep) {
  return (
    function linkVariable(d) {
      return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
    }
  )
}

function _linkConstant(linkStep) {
  return (
    function linkConstant(d) {
      return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
    }
  )
}

function _linkExtensionVariable(linkStep, innerRadius) {
  return (
    function linkExtensionVariable(d) {
      return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius);
    }
  )
}

function _linkExtensionConstant(linkStep, innerRadius) {
  return (
    function linkExtensionConstant(d) {
      return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
    }
  )
}

function _linkStep() {
  return (
    function linkStep(startAngle, startRadius, endAngle, endRadius) {
      const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI);
      const s0 = Math.sin(startAngle);
      const c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI);
      const s1 = Math.sin(endAngle);
      return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
    }
  )
}

async function _data(parseNewick, FileAttachment) {
  return (
    parseNewick(await FileAttachment("life.txt").text())
  )
}

function _width() {
  return (
    954
  )
}

function _outerRadius(width) {
  return (
    width / 2
  )
}

function _innerRadius(outerRadius) {
  return (
    outerRadius - 170
  )
}

function _parseNewick() {
  return (
    function parseNewick(a) { for (var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) { var n = s[t]; switch (n) { case "(": var c = {}; r.branchset = [c], e.push(r), r = c; break; case ",": var c = {}; e[e.length - 1].branchset.push(c), r = c; break; case ")": r = e.pop(); break; case ":": break; default: var h = s[t - 1]; ")" == h || "(" == h || "," == h ? r.name = n : ":" == h && (r.length = parseFloat(n)) } } return r }
  )
}

function _d3(require) {
  return (
    require("d3@6")
  )
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["life.txt", { url: new URL("./files/tree.txt", import.meta.url), mimeType: "text/plain", toString }]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable("viewof showLength").define("viewof showLength", ["html"], _showLength);
  main.variable("showLength").define("showLength", ["Generators", "viewof showLength"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3", "data", "cluster", "setRadius", "innerRadius", "maxLength", "setColor", "outerRadius", "width", "linkExtensionConstant", "linkConstant", "linkExtensionVariable", "linkVariable"], _chart);
  main.variable("update").define("update", ["chart", "showLength"], _update);
  main.variable("cluster").define("cluster", ["d3", "innerRadius"], _cluster);
  main.variable("color").define("color", ["d3"], _color);
  main.variable("maxLength").define("maxLength", ["d3"], _maxLength);
  main.variable("setRadius").define("setRadius", _setRadius);
  main.variable("setColor").define("setColor", ["color"], _setColor);
  main.variable("linkVariable").define("linkVariable", ["linkStep"], _linkVariable);
  main.variable("linkConstant").define("linkConstant", ["linkStep"], _linkConstant);
  main.variable("linkExtensionVariable").define("linkExtensionVariable", ["linkStep", "innerRadius"], _linkExtensionVariable);
  main.variable("linkExtensionConstant").define("linkExtensionConstant", ["linkStep", "innerRadius"], _linkExtensionConstant);
  main.variable("linkStep").define("linkStep", _linkStep);
  main.variable("data").define("data", ["parseNewick", "FileAttachment"], _data);
  main.variable("width").define("width", _width);
  main.variable("outerRadius").define("outerRadius", ["width"], _outerRadius);
  main.variable("innerRadius").define("innerRadius", ["outerRadius"], _innerRadius);
  main.variable("parseNewick").define("parseNewick", _parseNewick);
  main.variable("d3").define("d3", ["require"], _d3);
  return main;
}