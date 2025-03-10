// global_start is cartesian {x: number, y: number}
// start and end are polar {angle: number, distance: number}
// layer is the layer number
function line(global_start, start, end, layer) {
    const result = [];
    const start_x = global_start.x + start.distance * Math.cos(start.angle - Math.PI / 2);
    const start_y = global_start.y + start.distance * Math.sin(start.angle - Math.PI / 2);
    const end_x = global_start.x + end.distance * Math.cos(end.angle - Math.PI / 2);
    const end_y = global_start.y + end.distance * Math.sin(end.angle - Math.PI / 2);

    result.push([{ x: start_x, y: start_y }, { x: end_x, y: end_y }, layer]);
    return result;
}

// global_start is cartesian {x: number, y: number}
// sector_start and sector_end are sector boundaries in respect to the global_start
function branch(global_start, sector_start, sector_end, distance_start, height, branch_number, layer) {
    const result = [];
    // All branches in this set start from the same point (it's a tree)
    const common_start = {
        angle: (sector_start + sector_end) / 2,
        distance: distance_start
    };

    for (let i = 0; i < branch_number; i++) {
        const end_angle = sector_start + (i + 0.5) * (sector_end - sector_start) / branch_number;
        const end = {
            angle: end_angle,
            distance: distance_start + height
        };
        result.push(...line(global_start, common_start, end, layer));
    }
    return result;
}

// returns sectors start and end angles as pairs given the number of sectors
function sectors(start_angle, end_angle, number_of_sectors) {
    const result = [];
    const sector_step = (end_angle - start_angle) / number_of_sectors;
    for (let i = 0; i < number_of_sectors; i++) {
        const sector_start_angle = start_angle + i * sector_step;
        const sector_end_angle = start_angle + (i + 1) * sector_step;
        result.push([sector_start_angle, sector_end_angle]);
    }
    return result;
}

const golden_ratio = 1.62;

function tree_clock(global_start, start_angle, end_angle, height, factors) {
    const result = [];

    const N = factors.reduce((acc, factor) => acc * factor, 1);
    let last_layer_branch_number = 1;
    let distance_start = 0;
    let remaining_lines = N;
    let layer = 0;

    for (const factor of factors) {
        while (remaining_lines % factor === 0) {
            remaining_lines = Math.floor(remaining_lines / factor);
            let line_number = 1;
            for (const [sector_start, sector_end] of sectors(start_angle, end_angle, last_layer_branch_number)) {
                const layer_lines = branch(global_start, sector_start, sector_end, distance_start, height, factor, layer);
                // layer_lines.forEach(line => {
                // console.log(factors, line[2], line_number);
                // });
                result.push(...layer_lines.map(line => [...line, line_number++]));
            }
            last_layer_branch_number *= factor;
            distance_start += height;
            height /= golden_ratio;
            layer++;
        }
    }

    return result;
}

function tree_clock_new(global_start, start_angle, end_angle, line_length, factors) {
    let lines_total = factors.reduce((acc, curr) => acc * curr, 1);
    if (lines_total <= 0) {
        throw new Error("Invalid factors");
    }
    const dimension = 2; // x and y coordinates

    const polyline_segment_num = factors.length;
    const points_in_polyline = polyline_segment_num + 1;

    // Create a flat array to store all points
    const coords = new Int32Array(lines_total * points_in_polyline * dimension);

    // Fill the starting point (center) for all polylines
    for (let i = 0; i < lines_total; i++) {
        const firstPointIdx = i * points_in_polyline;
        coords[firstPointIdx * dimension] = global_start.x;
        coords[firstPointIdx * dimension + 1] = global_start.y;
    }

    let branch_num = 1;
    let radius = line_length;
    for (let layer = 1; layer < points_in_polyline; layer++) {
        const factor = factors[layer - 1];
        branch_num *= factor;

        const lines_per_branch = lines_total / branch_num;
        const angle_step = (end_angle - start_angle) / branch_num;

        // For each branch at this layer
        for (let branch = 0; branch < branch_num; branch++) {
            const branch_angle = start_angle + (branch + 0.5) * angle_step;

            // For each line in this branch
            for (let line = 0; line < lines_per_branch; line++) {
                // Calculate the global line index
                const lineIdx = branch * lines_per_branch + line;

                // Calculate coordinates for this point
                const x = global_start.x + Math.cos(branch_angle) * radius;
                const y = global_start.y + Math.sin(branch_angle) * radius;

                // Store coordinates for this layer's point
                const pointIdx = lineIdx * points_in_polyline + layer;
                const coordIdx = pointIdx * dimension;
                coords[coordIdx] = x;
                coords[coordIdx + 1] = y;
            }
        }

        radius += line_length;
        line_length /= golden_ratio;
    }

    return coords;
}
