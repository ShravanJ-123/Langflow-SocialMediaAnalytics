document.addEventListener("DOMContentLoaded", function () {
    const accountsDropdown = document.getElementById("accounts");
    const analyzeBtn = document.getElementById("analyze-btn");
    const quickGlanceContainer = document.getElementById("quick-glance");
    const analysisResultsContainer = document.getElementById("analysis-results");
    const chatContainer = document.getElementById("chat");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const instagramEmbedContainer = document.getElementById("instagram-embed");

    let selectedAccount = "";

    // Instagram profile links for embedding
    const accountLinks = {
        "ranveer": "https://www.instagram.com/beerbiceps/",
        "hitesh": "https://www.instagram.com/hiteshchoudharyofficial/"
    };

    // Function to reset chat and analysis when switching accounts
    function resetChatAndAnalysis() {
        // Reset analysis and chat containers
        analysisResultsContainer.innerHTML = `<h2>Analysis Results</h2><p>Insights will appear here...</p>`;
        chatContainer.innerHTML = `<p>Chat for ${selectedAccount} will appear here...</p>`;
        messageInput.value = ""; // Clear input field
    
        // Reset graphs by removing their content
        d3.select("#engagementGraph").selectAll("*").remove();  
        d3.select("#donutChart").selectAll("*").remove();       
    }

    // Function to embed Instagram profile dynamically
    function updateInstagramEmbed() {
        if (selectedAccount && accountLinks[selectedAccount]) {
            instagramEmbedContainer.innerHTML = `
                <iframe src="${accountLinks[selectedAccount]}embed/" width="820" height="350" frameborder="0" scrolling="yes"></iframe>
            `;
        } else {
            instagramEmbedContainer.innerHTML = `<p>Select an account to see the profile.</p>`;
        }
    }

    // Handle account selection
    accountsDropdown.addEventListener("change", () => {
        selectedAccount = accountsDropdown.value;
        resetChatAndAnalysis();
        updateInstagramEmbed();
        quickGlanceContainer.style.display = "block";  
    });

    analyzeBtn.addEventListener("click", () => {
        if (!selectedAccount) {
            alert("Please select an Instagram account first.");
            return;
        }
    
        analysisResultsContainer.innerHTML = `
            <h2>Analyzing ${selectedAccount}...</h2>
            <div class="spinner"></div>
        `;
    
        setTimeout(() => {
            let analysisContent;
    
            if (selectedAccount === "ranveer") {
                analysisContent = `
                    <h2>Analysis Results for ${selectedAccount}</h2>
<p>📊 Engagement Rate: 50.6%</p>
<p>📸 Total Posts Analyzed: 29</p>
<p>🔥 Average Likes per Post: 403,633</p>
<p>💬 Average Comments per Post: 1,172</p>
<p>📈 Average Views per Reel: 2,893,437</p>
<p>🕒 Average Reel Duration: 112.9 seconds</p>
<p>🕒 Average Post Caption Length: 530 characters</p>
<p>📉 Lowest Performing Reel: 427,010 views</p>
<p>💡 Since carousels make up 65.5% of your content and deliver strong engagement, focus on optimizing carousel design with eye-catching visuals and swipe-worthy storytelling. Reels still drive high visibility, so balancing both formats will maximize growth.</p>

                `;
            } else if (selectedAccount === "hitesh") {
                analysisContent = `
                 <h2>Analysis Results for ${selectedAccount}</h2>
<p>📊 Engagement Rate : 43.4%</p>
<p>📸 Total Posts Analyzed: 29</p>
<p>🔥 Average Likes per Post: 2,490</p>
<p>💬 Average Comments per Post: 26</p>
<p>📈 Average Views per Reel: 15,723</p>
<p>🕒 Average Reel Duration: 72.4 seconds</p>
<p>🕒 Average Post Caption Length: 46 characters</p>
<p>📉 Lowest Performing Reel: 6,255 views</p>
<p>💡Since reels make up 72% of your content and drive higher views on average, balancing with carousel or image posts could diversify your reach.Short captions are great for quick impact, but combining them with cool hashtags can boost comments and shares</p>

                `;
            } else {
                analysisContent = `<p>No data available for ${selectedAccount}.</p>`;
            }
    
            analysisResultsContainer.innerHTML = analysisContent;
    
            const csvFile = selectedAccount === "ranveer" ? "static/data/Copy of Ranveer - Ranveer.csv" : "static/data/Copy of hitesh - Sheet1.csv";
            loadData(csvFile);  // Load the appropriate CSV file
            quickGlanceContainer.style.display = "block";  // Show quick glance
        }, 2000);
    });
    

    // Handle message sending to Flask API
    function sendMessage() {
        if (!selectedAccount) {
            alert("Please select an Instagram account first.");
            return;
        }

        const message = messageInput.value.trim();
        if (!message) {
            alert("Please enter a message.");
            return;
        }

        displayMessage(message, "user-message");
        messageInput.value = "";

        // Show loading spinner in chat
        const loadingMessage = document.createElement("div");
        loadingMessage.classList.add("response");
        loadingMessage.id = "loadingMessage";
        loadingMessage.innerHTML = `<div class="spinner"></div><p>Generating response...</p>`;
        chatContainer.appendChild(loadingMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Send request to Flask API
        fetch("https://langflow-socialmediaanalytics.onrender.com/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message, account: selectedAccount })
        })
        .then(response => response.json())
        .then(data => {
            const responseMessage = data.outputs[0].outputs[0].artifacts.message;
            displayMessage(responseMessage, "response");
            document.getElementById("loadingMessage").remove();
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("loadingMessage").remove();
        });
    }

        function displayMessage(message, messageType) {
        const messageElement = document.createElement("div");
        messageElement.classList.add(messageType);
    
        // Create a container for message and avatar
        const messageContainer = document.createElement("div");
        messageContainer.classList.add("message-container");
    
        // Add avatar
        const avatar = document.createElement("div");
        avatar.classList.add("avatar");
        avatar.textContent = messageType === "user-message" ? "🧑" : "🤖"; 
    
        // Add message content
        const messageContent = document.createElement("div");
        messageContent.classList.add("message-content");
        messageContent.textContent = message;
    
        // Assemble the message container
        if (messageType === "user-message") {
            messageContainer.classList.add("user");
            messageContainer.appendChild(messageContent);
            messageContainer.appendChild(avatar);
        } else {
            messageContainer.classList.add("bot");
            messageContainer.appendChild(avatar);
            messageContainer.appendChild(messageContent);
        }
    
        chatContainer.appendChild(messageContainer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    sendButton.addEventListener("click", sendMessage);
});


function loadData(fileName) {
    d3.csv(fileName).then(function(data) {
        console.log("Loaded Data:", data); // Log the loaded data
        const parseDate = d3.timeParse("%Y-%m-%dT%H:%M");

        data.forEach(function(d) {
            if (!d.timestamp) {
                console.error("Missing timestamp in row:", d);
                return;
            }

            let parts = d.timestamp.split("T");  
            if (parts.length !== 2) {
                console.error("Invalid timestamp format:", d.timestamp);
                return;
            }

            let dateParts = parts[0].split("-"); 
            if (dateParts.length !== 3) {
                console.error("Invalid date format:", d.timestamp);
                return;
            }

            let year = parseInt(dateParts[0], 10);
            if (year < 100) { 
                year += (year >= 0 && year <= 30) ? 2000 : 1900;
            }

            let fixedTimestamp = `${year}-${dateParts[1]}-${dateParts[2]}T${parts[1]}`;
            d.timestamp = parseDate(fixedTimestamp);

            if (!d.timestamp || isNaN(d.timestamp.getTime())) {
                console.error("Error parsing timestamp:", fixedTimestamp);
            }

            d.likesCount = +d.likesCount || 0;  
            d.commentsCount = +d.commentsCount || 0;  
            d.reach = +d.reach || 0; 
            d.engagementRate = d.reach > 0 ? ((d.likesCount + d.commentsCount) / d.reach) * 100 : 0;
            d.date = d3.timeFormat("%Y-%m-%d")(d.timestamp);
        });

        // Prepare Data for Graph1 (Engagement Trends)
        const groupedData = d3.group(data, d => d.date);
        const aggregatedData = Array.from(groupedData, ([key, values]) => ({
            key: new Date(key),
            value: d3.sum(values, d => d.likesCount)
        }));

        // Prepare Data for Graph2 (Post Type-Wise Engagement)
        const postTypeEngagement = d3.rollup(data, 
            v => d3.sum(v, d => d.likesCount), 
            d => d.type
        );
        const donutData = Array.from(postTypeEngagement, ([key, value]) => ({ type: key, value }));

        // 🎨 Draw Both Graphs
        setupGraph(aggregatedData);  // Engagement Trends (Line Graph)
        setupDonutChart(donutData);  // Post Type-Wise Engagement (Donut Chart)

    }).catch(function(error) {
        console.error('Error loading the CSV data:', error);
    });
}


function setupGraph(data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const containerWidth = document.getElementById('graph1').clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Remove previous graph before redrawing
    d3.select("#engagementGraph").selectAll("*").remove();

    // Create and append SVG with viewBox for responsive scaling
    const svg = d3.select("#engagementGraph")
        .attr("viewBox", `0 0 ${containerWidth} 400`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    // Define line generator
    const line = d3.line()
        .x(d => x(d.key))
        .y(d => y(d.value));

    // Set domains
    x.domain(d3.extent(data, d => d.key));
    y.domain([0, d3.max(data, d => d.value) || 1]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Animate the line drawing
    const path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    const totalLength = path.node().getTotalLength(); // Get length of the path

    path
        .attr("stroke-dasharray", totalLength + " " + totalLength) // Set stroke length
        .attr("stroke-dashoffset", totalLength) // Hide the stroke initially
        .transition()
        .duration(2000) // Animation duration
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0); // Draw the line smoothly

    // Create tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("font-size", "14px");

    // Animate the data points appearing one by one with hover tooltip
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.key))
        .attr("cy", d => y(d.value))
        .attr("r", 0) 
        .transition()
        .delay((d, i) => i * 200) 
        .duration(500)
        .attr("r", 5) 
        .on("end", function () {
            // Add hover functionality after animation completes
            d3.select(this)
                .on("mouseover", function (event, d) {
                    tooltip.style("opacity", 1)
                        .html(`📅 <b>${d3.timeFormat("%d-%m-%Y")(d.key)}</b><br>❤️ <b>${d.value} Likes</b>`)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 30}px`);
                    d3.select(this).transition().duration(200).attr("r", 8); 
                })
                .on("mousemove", function (event) {
                    tooltip.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 30}px`);
                })
                .on("mouseout", function () {
                    tooltip.style("opacity", 0);
                    d3.select(this).transition().duration(200).attr("r", 5); 
                });
        });
}
function setupDonutChart(data) {
    const width = 300, height = 300, radius = Math.min(width, height) / 2;

    const svg = d3.select("#donutChart")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.type))
        .range(["#ff7f0e", "#1f77b4", "#2ca02c"]); // Colors for Reel, Carousel, Static Image

    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius * 0.9);
    const outerArc = d3.arc().innerRadius(radius * 1.1).outerRadius(radius * 1.1); 

    const arcs = svg.selectAll("arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    // Create the pie chart arcs
    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.type))
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
            const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function(t) { return arc(i(t)); };
        });

    // // Labels Outside the Chart
    // arcs.append("text")
    //     .attr("transform", d => `translate(${outerArc.centroid(d)})`)
    //     .attr("dy", "0.35em")
    //     .style("text-anchor", "middle")
    //     .style("font-size", "12px")
    //     .style("font-weight", "bold")
    //     .style("fill", "#333")
    //     .text(d => `${d.data.type}: ${d.data.value}`);

    // Tooltip on Hover
    arcs.on("mouseover", function(event, d) {
        d3.select("#tooltipDonut")
            .style("opacity", 1)
            .html(`<b>${d.data.type}</b>: ${d.data.value}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
    }).on("mouseout", function() {
        d3.select("#tooltipDonut").style("opacity", 0);
    });
}

// Load data and draw graph
loadData();


console.log("Aggregated Data for Graph 1:", aggregatedData);
console.log("Donut Data for Graph 2:", donutData);
