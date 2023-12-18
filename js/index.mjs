function getTime(hhmm) {
  const [minutes, seconds] = hhmm.split(":");
  const time = new Date();
  time.setMinutes(minutes);
  time.setSeconds(seconds);
  return time;
}

document.addEventListener("DOMContentLoaded", async () => {
  const width = 1200;
  const height = 680;
  const marginTop = 20;
  const marginRight = 20;
  const marginBottom = 30;
  const marginLeft = 40;

  const cyclists = await d3.json(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
  );

  const x = d3
    .scaleUtc()
    .domain([
      d3.min(cyclists, (d) => {
        const date = new Date();
        date.setYear(d.Year);
        return date;
      }),
      d3.max(cyclists, (d) => {
        const date = new Date();
        date.setYear(d.Year);
        return date;
      }),
    ])
    .range([marginLeft, width - marginRight])
    .nice();

  const minDate = d3.min(cyclists, (d) => getTime(d.Time));

  const maxDate = d3.max(cyclists, (d) => getTime(d.Time));

  const y = d3
    .scaleUtc()
    .domain([maxDate, minDate])
    .range([height - marginBottom, marginTop]);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, -height / 4, width, height + 300])
    .attr("style", "max-width: 100%; height: auto;");

  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).tickFormat(d3.timeFormat("%M:%S")));

  svg
    .append("g")
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call((g) =>
      g
        .append("g")
        .selectAll("line")
        .data(x.ticks())
        .join("line")
        .attr("x1", (d) => 0.5 + x(d))
        .attr("x2", (d) => 0.5 + x(d))
        .attr("y1", marginTop)
        .attr("y2", height - marginBottom)
    )
    .call((g) =>
      g
        .append("g")
        .selectAll("line")
        .data(y.ticks())
        .join("line")
        .attr("y1", (d) => 0.5 + y(d))
        .attr("y2", (d) => 0.5 + y(d))
        .attr("x1", marginLeft)
        .attr("x2", width - marginRight)
    );

  svg
    .append("g")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(cyclists)
    .join("circle")
    .on(
      "mouseover",
      function (
        e,
        { Doping, Name, Nationality, Place, Seconds, Time, URL, Year }
      ) {
        const w = 300;
        const h = 80;
        const [x, y] = d3.pointer(e);

        const g = svg.append("g").attr("id", "tooltip").attr("data-year", Year);

        g.append("rect")
          .attr("height", h)
          .attr("width", w + 100)
          .attr("x", x + 5)
          .attr("y", y - h / 2)
          .attr("fill", "white")
          .attr("stroke", "black");

        g.append("text")
          .text(`${Name} - ${Year}`)
          .attr("x", x + 20)
          .attr("y", y)
          .style("font-size", "14px")
          .attr("fill", "black");

        g.append("text")
          .text(`${Doping}`)
          .attr("x", x + 20)
          .attr("y", y + 14)
          .style("font-size", "14px")
          .attr("fill", "black");
      }
    )
    .on("mouseleave", function (e) {
      svg.selectAll("#tooltip").remove();
    })
    .attr("class", "dot")
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => getTime(d.Time))
    .attr("stroke", (d) => (d.Doping ? "red" : "blue"))
    .attr("fill", (d) => (d.Doping ? "pink" : "lightblue"))
    .attr("cx", (d) => {
      const date = new Date();
      date.setYear(d.Year);
      return x(date);
    })
    .attr("cy", (d) => y(getTime(d.Time)))
    .attr("r", 5);

  const legendData = [
    { label: "No Doping Allegation", color: "lightblue", stroke: "blue" },
    { label: "Doping Allegation", color: "pink", stroke: "red" },
  ];

  // Create the legend container
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${width - marginRight - 300},${marginTop})`);

  // Append legend items
  legend
    .selectAll("circle")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("height", 20)
    .attr("width", 20)
    .attr("x", 10)
    .attr("y", (d, i) => 25 * i)
    .attr("fill", (d) => d.color)
    .attr("stroke", (d) => d.stroke);

  legend
    .selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 40)
    .attr("y", (d, i) => 25 * i + 15)
    .text((d) => d.label)
    .attr("alignment-baseline", "middle");

  const container = document.querySelector(".container");
  const title = document.createElement("h1");
  title.id = "title";
  title.textContent = cyclists.name;
  container.appendChild(title);
  container.appendChild(svg.node());

  document.body.appendChild(container);
});
