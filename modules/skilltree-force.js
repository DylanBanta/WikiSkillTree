console.log("Loaded skilltree.js");

// Ensure D3.js is loaded before running the script
function loadD3(callback) {
    if (window.d3) {
        console.log("D3.js already loaded");
        callback();
    } else {
        console.log("Loading D3.js...");
        var script = document.createElement("script");
        script.src = "https://d3js.org/d3.v6.min.js";
        script.onload = function () {
            console.log("D3.js loaded");
            callback();
        };
        document.head.appendChild(script);
    }
}

loadD3(function () {
    console.log("Initializing structured force-directed skill graph...");

    // Constants for layout
    const width = 1000;
    const height = 600;
    const rectWidth = 125;
    const rectHeight = 40;

    // Node colors
    const rootColor = "red";
    const childColor = "blue";
    const strokeColor = "#000";
    const strokeWidth = 2;
    const textColor = "white";
    const fontSize = "14px";

    // Define skills
    const skills = [
        { id: "Elemental Access" },
        { id: "Fire Access" },
        { id: "Conjure Fire" },
        { id: "Manipulate Fire" },
        { id: "Fire Lock" },
        { id: "Fire Grasp" },
        { id: "Fire Beam" },
        { id: "Fire Cone" },
        { id: "Fire Sphere" },
        { id: "Fire Imbue" },
        { id: "Fire Enchant" },
        { id: "Fire Resistance" },
        { id: "Fire Immunity" },
        { id: "Fire Immunity 2" },
        { id: "Fire Nullification" },
        { id: "Water Access" },
        { id: "Conjure Water" },
        { id: "Manipulate Water" },
        { id: "Water Lock" },
        { id: "Water Grasp" },
        { id: "Water Beam" },
        { id: "Water Cone" },
        { id: "Water Sphere" },
        { id: "Water Imbue" },
        { id: "Water Enchant" },
        { id: "Water Resistance" },
        { id: "Water Immunity" },
        { id: "Water Nullification" },
    ];

    // Define links (prerequisites)
    const links = [
        { source: "Elemental Access", target: "Fire Access" },
        { source: "Fire Access", target: "Conjure Fire" },
        { source: "Fire Access", target: "Manipulate Fire" },
        { source: "Conjure Fire", target: "Fire Lock" },
        { source: "Manipulate Fire", target: "Fire Lock" },
        { source: "Fire Lock", target: "Fire Grasp" },
        { source: "Fire Lock", target: "Fire Beam" },
        { source: "Fire Lock", target: "Fire Cone" },
        { source: "Fire Lock", target: "Fire Sphere" },
        { source: "Fire Lock", target: "Fire Imbue" },
        { source: "Fire Imbue", target: "Fire Enchant" },
        { source: "Fire Lock", target: "Fire Resistance" },
        { source: "Fire Resistance", target: "Fire Immunity" },
        { source: "Fire Resistance", target: "Fire Immunity 2" },
        { source: "Fire Immunity", target: "Fire Nullification" },
        { source: "Elemental Access", target: "Water Access" },
        { source: "Water Access", target: "Conjure Water" },
        { source: "Water Access", target: "Manipulate Water" },
        { source: "Conjure Water", target: "Water Lock" },
        { source: "Manipulate Water", target: "Water Lock" },
        { source: "Water Lock", target: "Water Grasp" },
        { source: "Water Lock", target: "Water Beam" },
        { source: "Water Lock", target: "Water Cone" },
        { source: "Water Lock", target: "Water Sphere" },
        { source: "Water Lock", target: "Water Imbue" },
        { source: "Water Imbue", target: "Water Enchant" },
        { source: "Water Lock", target: "Water Resistance" },
        { source: "Water Resistance", target: "Water Immunity" },
        { source: "Water Immunity", target: "Water Nullification" },
    ];

    // Compute child count for spacing logic
    const childCount = {};
    links.forEach(link => {
        childCount[link.source] = (childCount[link.source] || 0) + 1;
    });

    // Create SVG canvas
    const svg = d3.select("#skill-tree-container-force")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function (event) {
            container.attr("transform", event.transform);
        }))
        .append("g");

    // Group for zoom & pan
    const container = svg.append("g");

    // Define force simulation with collision handling
    const simulation = d3.forceSimulation(skills)
        .force("link", d3.forceLink(links)
            .id(d => d.id)
            .distance(d => 100 + (childCount[d.source.id] || 1) * 30) // More children → Larger distance
        )
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(rectWidth * 0.9)) // Prevent overlap
        .on("tick", ticked);

    // Draw links
    const link = container.selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .style("stroke", "#aaa")
        .style("stroke-width", "2px");

    // Draw nodes
    const node = container.selectAll(".node")
        .data(skills)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

    // Add rectangles for nodes
    node.append("rect")
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("x", -rectWidth / 2)
        .attr("y", -rectHeight / 2)
        .style("fill", d => d.id === "Elemental Access" ? rootColor : childColor)
        .style("stroke", strokeColor)
        .style("stroke-width", strokeWidth);

    // Add text inside the rectangles
    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("font-size", fontSize)
        .style("fill", textColor)
        .text(d => d.id);

    // Update positions on simulation tick
    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    }

    // Drag event handlers
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
});
