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
    console.log("Initializing skill tree...");

    // Constants for layout
    const width = 1000;
    const height = 600;
    const nodeSpacingX = 150;
    const nodeSpacingY = 150;

    // Constants for node styling
    const rectWidth = 125;
    const rectHeight = 40;
    const rectX = -rectWidth / 2;
    const rectY = -rectHeight / 2;
    const rootColor = "red";
    const childColor = "blue";
    const strokeColor = "#000";
    const strokeWidth = 2;
    const textColor = "white";
    const fontSize = "14px";

    // Define skills
        // Define skills with unique instances
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
    
        // Define prerequisites (links)
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
    

    // Create a map for quick lookup
    const skillMap = {};
    skills.forEach(skill => skillMap[skill.id] = { ...skill, parents: [], children: [] });

    // Process links to assign parents/children
    links.forEach(link => {
        const source = skillMap[link.source];
        const target = skillMap[link.target];
        if (source && target) {
            source.children.push(target);
            target.parents.push(source);
        }
    });

    // Identify root nodes
    const rootNodes = Object.values(skillMap).filter(node => node.parents.length === 0);

    // Calculate tree width recursively
    function calculateSpread(node) {
        if (node.children.length === 0) {
            node.width = 1; // Leaf nodes have width 1
            return node.width;
        }

        let totalWidth = 0;
        node.children.forEach(child => {
            totalWidth += calculateSpread(child);
        });

        node.width = totalWidth;
        return totalWidth;
    }

    // Compute spreads for each tree
    const treePositions = [];
    let currentX = width / 4;
    rootNodes.forEach(root => {
        calculateSpread(root);
        treePositions.push({ root, x: currentX });
        currentX += root.width * nodeSpacingX;
    });

    // Assign depth levels
    function computeDepths() {
        const queue = rootNodes.map(root => ({ node: root, depth: 0 }));
        while (queue.length > 0) {
            const { node, depth } = queue.shift();
            node.depth = depth;
            node.children.forEach(child => queue.push({ node: child, depth: depth + 1 }));
        }
    }
    computeDepths();

    // Assign X positions while considering sibling subtree widths
    function assignXPositions(node, startX) {
        if (node.parents.length > 1) {
            // Multi-parent case: Center the node between its leftmost and rightmost parents
            const parentXs = node.parents.map(p => p.x);
            node.x = (Math.min(...parentXs) + Math.max(...parentXs)) / 2;
        } else if (!node.parents.length) {
            // Root node: Set starting X position
            node.x = startX;
        }
    
        if (node.children.length > 0) {
            let totalChildWidth = node.children.reduce((sum, child) => sum + child.width, 0);
            let normalizedSpacing = Math.max(nodeSpacingX, (node.width * nodeSpacingX) / totalChildWidth);
    
            let cumulativeX = node.x - (totalChildWidth * normalizedSpacing) / 2;
    
            node.children.forEach(child => {
                let childX = cumulativeX + (child.width * normalizedSpacing) / 2;
                child.x = childX;
                cumulativeX += child.width * normalizedSpacing;
    
                assignXPositions(child, childX);
            });
        }
    }
    
    

    treePositions.forEach(({ root, x }) => {
        assignXPositions(root, x);
    });

    // Assign final Y positions
    Object.values(skillMap).forEach(node => {
        node.y = height - node.depth * nodeSpacingY;
    });

    // Create SVG canvas
    const svg = d3.select("#skill-tree-container-tree")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function (event) {
            container.attr("transform", event.transform);
        }))
        .append("g");

    // Add a group for panning
    const container = svg.append("g");

    // Draw links
    container.selectAll("path.link")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d => {
            const sourceNode = skillMap[d.source];
            const targetNode = skillMap[d.target];

            if (!sourceNode || !targetNode) {
                console.error("Could not find nodes for link:", d);
                return null;
            }

            return `M${sourceNode.x},${sourceNode.y} C${sourceNode.x},${(sourceNode.y + targetNode.y) / 2} ${targetNode.x},${(sourceNode.y + targetNode.y) / 2} ${targetNode.x},${targetNode.y}`;
        })
        .style("stroke", "#aaa")
        .style("stroke-width", "2px")
        .style("fill", "none");

    // Draw nodes as rectangles
    const node = container.selectAll("g.node")
        .data(Object.values(skillMap))
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add rectangles for nodes
    node.append("rect")
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("x", rectX)
        .attr("y", rectY)
        .style("fill", d => (d.depth === 0 ? rootColor : childColor))
        .style("stroke", strokeColor)
        .style("stroke-width", strokeWidth);

    // Add text inside the rectangles
    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("font-size", fontSize)
        .style("fill", textColor)
        .text(d => d.id);
});
