#!/usr/bin/env python3
"""
Python script to generate a publication-quality 3x3 multi-panel training & evaluation chart
matching the user's requested white background academic paper layout (IEEE/Nature ML style).
"""

import math
import os

def generate_white_academic_svg():
    width = 1400
    height = 1050
    
    bg_color = "#ffffff"
    card_bg = "#ffffff"
    border_color = "#d1d5db"
    grid_color = "#e5e7eb"
    text_dark = "#111827"
    text_muted = "#4b5563"
    text_subtext = "#6b7280"
    
    # Curves colors
    c_train = "#1d4ed8"  # Royal Blue
    c_val = "#ea580c"    # Orange / Amber
    c_line_dash = "#9ca3af" # Dashed optimal epoch line

    epochs = list(range(1, 22))
    
    # Mathematical functions to simulate realistic ML training/validation curves
    # Early stopping around epoch 7
    def get_data():
        train_loss = [1.55 - 0.28*math.log(i) - 0.02*i for i in epochs]
        val_loss = [1.42, 1.09, 0.98, 0.89, 0.87, 0.85, 0.81, 0.80, 0.76, 0.72, 0.71, 0.72, 0.73, 0.74, 0.74, 0.74, 0.73, 0.74, 0.75, 0.75, 0.75]
        
        train_acc = [0.38 + 0.18*math.log(i) + 0.005*i for i in epochs]
        val_acc = [0.68, 0.69, 0.66, 0.69, 0.71, 0.70, 0.70, 0.71, 0.72, 0.76, 0.79, 0.79, 0.80, 0.80, 0.81, 0.80, 0.80, 0.80, 0.81, 0.80, 0.81]

        train_sens = [0.39 + 0.18*math.log(i) + 0.006*i for i in epochs]
        val_sens = [0.50, 0.52, 0.54, 0.56, 0.56, 0.57, 0.59, 0.60, 0.61, 0.62, 0.62, 0.63, 0.62, 0.63, 0.61, 0.62, 0.63, 0.62, 0.61, 0.61, 0.61]

        train_spec = [0.84 + 0.02*i - 0.0003*(i**2) for i in epochs]
        val_spec = [0.92, 0.92, 0.92, 0.92, 0.93, 0.93, 0.93, 0.94, 0.94, 0.94, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95]

        train_kappa = [0.41 + 0.18*math.log(i) + 0.005*i for i in epochs]
        val_kappa = [0.72, 0.73, 0.78, 0.77, 0.78, 0.78, 0.79, 0.80, 0.81, 0.83, 0.85, 0.84, 0.85, 0.85, 0.86, 0.85, 0.85, 0.85, 0.85, 0.85, 0.86]

        train_f1 = [0.36 + 0.19*math.log(i) + 0.005*i for i in epochs]
        val_f1 = [0.48, 0.47, 0.48, 0.50, 0.52, 0.51, 0.53, 0.54, 0.58, 0.60, 0.62, 0.62, 0.63, 0.62, 0.63, 0.63, 0.62, 0.63, 0.62, 0.62, 0.63]

        train_gmean = [0.38 + 0.19*math.log(i) + 0.006*i for i in epochs]
        val_gmean = [0.42, 0.37, 0.48, 0.50, 0.52, 0.50, 0.53, 0.54, 0.58, 0.59, 0.58, 0.59, 0.59, 0.59, 0.57, 0.59, 0.58, 0.57, 0.57, 0.56, 0.56]

        train_logloss = [1.54 - 0.28*math.log(i) - 0.02*i for i in epochs]
        val_logloss = [1.42, 1.05, 0.95, 0.86, 0.80, 0.78, 0.72, 0.70, 0.66, 0.62, 0.59, 0.57, 0.57, 0.58, 0.58, 0.58, 0.59, 0.58, 0.59, 0.60, 0.59]

        # Model benchmark metrics for 9th panel
        models_name = ["Rule", "LogReg", "RF", "GBDT", "Distil", "Hybrid"]
        models_acc = [0.742, 0.816, 0.864, 0.892, 0.915, 0.968]
        models_f1 = [0.697, 0.793, 0.849, 0.882, 0.904, 0.960]

        return {
            "Loss": (train_loss, val_loss, 0.0, 1.6),
            "Accuracy": (train_acc, val_acc, 0.4, 1.0),
            "Sensitivity": (train_sens, val_sens, 0.4, 1.0),
            "Specificity": (train_spec, val_spec, 0.84, 1.0),
            "QW Kappa": (train_kappa, val_kappa, 0.4, 1.0),
            "F1-score": (train_f1, val_f1, 0.4, 1.0),
            "G-Mean": (train_gmean, val_gmean, 0.3, 1.0),
            "Log Loss": (train_logloss, val_logloss, 0.0, 1.6),
            "Model Comparison": (models_name, models_acc, models_f1)
        }

    dataset = get_data()

    subplots = [
        ("Loss", dataset["Loss"]),
        ("Accuracy", dataset["Accuracy"]),
        ("Sensitivity", dataset["Sensitivity"]),
        ("Specificity", dataset["Specificity"]),
        ("QW Kappa", dataset["QW Kappa"]),
        ("F1-score", dataset["F1-score"]),
        ("G-Mean", dataset["G-Mean"]),
        ("Log Loss", dataset["Log Loss"]),
        ("Benchmark Accuracy & F1", dataset["Model Comparison"])
    ]

    cols = 3
    rows = 3
    margin_top = 80
    margin_bottom = 40
    margin_left = 60
    margin_right = 40

    plot_w = (width - margin_left - margin_right - (cols - 1) * 35) / cols
    plot_h = (height - margin_top - margin_bottom - (rows - 1) * 35) / rows

    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" style="background-color:{bg_color}; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;">')

    # Overall Header
    svg.append(f'''
    <text x="{margin_left}" y="36" fill="{text_dark}" font-size="20" font-weight="800" letter-spacing="-0.5px">Machine Learning Multi-Metric Convergence &amp; Benchmark Metrics</text>
    <text x="{margin_left}" y="56" fill="{text_muted}" font-size="13">Publication-Ready Evaluation Plots across 21 Epochs &amp; Architecture Benchmarks (Train vs Validation)</text>
    ''')

    for idx, (title, pdata) in enumerate(subplots):
        r = idx // cols
        c = idx % cols
        
        x0 = margin_left + c * (plot_w + 35)
        y0 = margin_top + r * (plot_h + 35)

        # Plot Frame Box
        svg.append(f'<rect x="{x0}" y="{y0}" width="{plot_w}" height="{plot_h}" fill="{card_bg}" stroke="{border_color}" stroke-width="1.2" rx="4"/>')
        
        # Subplot Title
        svg.append(f'<text x="{x0 + plot_w/2}" y="{y0 + 20}" fill="{text_dark}" font-size="13" font-weight="700" text-anchor="middle">{title}</text>')

        if idx < 8:
            train_vals, val_vals, min_y, max_y = pdata
            
            p_left = x0 + 42
            p_right = x0 + plot_w - 15
            p_top = y0 + 32
            p_bottom = y0 + plot_h - 28
            
            pw = p_right - p_left
            ph = p_bottom - p_top

            # Y-Grid lines
            y_steps = 5
            for i in range(y_steps):
                y_val = min_y + (i / (y_steps - 1)) * (max_y - min_y)
                y_pos = p_bottom - (i / (y_steps - 1)) * ph
                svg.append(f'<line x1="{p_left}" y1="{y_pos}" x2="{p_right}" y2="{y_pos}" stroke="{grid_color}" stroke-width="1"/>')
                svg.append(f'<text x="{p_left - 6}" y="{y_pos + 4}" fill="{text_subtext}" font-size="10" font-family="monospace" text-anchor="end">{y_val:.2f}</text>')

            # X-Grid lines & Ticks (Epochs 0.0, 2.5, 5.0, 7.5, 10.0, 12.5, 15.0, 17.5, 20.0)
            x_ticks = [0, 2.5, 5.0, 7.5, 10.0, 12.5, 15.0, 17.5, 20.0]
            for xt in x_ticks:
                xp = p_left + (xt / 20.0) * pw
                svg.append(f'<line x1="{xp}" y1="{p_top}" x2="{xp}" y2="{p_bottom}" stroke="{grid_color}" stroke-width="1"/>')
                svg.append(f'<text x="{xp}" y="{p_bottom + 14}" fill="{text_subtext}" font-size="9.5" font-family="monospace" text-anchor="middle">{xt:.1f}</text>')

            # Vertical Dashed Epoch Line (at Epoch ~7)
            opt_x = p_left + (6.0 / 20.0) * pw
            svg.append(f'<line x1="{opt_x}" y1="{p_top}" x2="{opt_x}" y2="{p_bottom}" stroke="{c_line_dash}" stroke-width="1.2" stroke-dasharray="4 3"/>')

            # Build line path for Train
            def map_pts(vals):
                pts = []
                for i, v in enumerate(vals):
                    cx = p_left + (i / 20.0) * pw
                    cy = p_bottom - ((v - min_y) / (max_y - min_y)) * ph
                    pts.append((cx, cy))
                return pts

            tr_pts = map_pts(train_vals)
            va_pts = map_pts(val_vals)

            def pts_to_path(pts):
                d = f"M {pts[0][0]:.1f} {pts[0][1]:.1f}"
                for p in pts[1:]:
                    d += f" L {p[0]:.1f} {p[1]:.1f}"
                return d

            svg.append(f'<path d="{pts_to_path(tr_pts)}" fill="none" stroke="{c_train}" stroke-width="2" stroke-linejoin="round"/>')
            svg.append(f'<path d="{pts_to_path(va_pts)}" fill="none" stroke="{c_val}" stroke-width="2" stroke-linejoin="round"/>')

            # Legend in Subplot
            leg_w = 54
            leg_h = 28
            lx = p_left + 8
            ly = p_top + 4
            svg.append(f'<rect x="{lx}" y="{ly}" width="{leg_w}" height="{leg_h}" fill="#ffffff" stroke="{border_color}" stroke-width="0.8" rx="3" opacity="0.95"/>')
            
            # Train legend
            svg.append(f'<line x1="{lx+5}" y1="{ly+9}" x2="{lx+18}" y2="{ly+9}" stroke="{c_train}" stroke-width="2"/>')
            svg.append(f'<text x="{lx+22}" y="{ly+12}" fill="{text_dark}" font-size="9" font-weight="600">Train</text>')
            
            # Val legend
            svg.append(f'<line x1="{lx+5}" y1="{ly+20}" x2="{lx+18}" y2="{ly+20}" stroke="{c_val}" stroke-width="2"/>')
            svg.append(f'<text x="{lx+22}" y="{ly+23}" fill="{text_dark}" font-size="9" font-weight="600">Val</text>')

        else:
            # 9th Plot: Model Benchmark Bar / Comparison Chart
            models_name, models_acc, models_f1 = pdata
            
            p_left = x0 + 42
            p_right = x0 + plot_w - 15
            p_top = y0 + 32
            p_bottom = y0 + plot_h - 28
            
            pw = p_right - p_left
            ph = p_bottom - p_top

            # Y Grid (0.60 to 1.00)
            for i in range(5):
                y_v = 0.60 + i * 0.10
                y_p = p_bottom - (i / 4.0) * ph
                svg.append(f'<line x1="{p_left}" y1="{y_p}" x2="{p_right}" y2="{y_p}" stroke="{grid_color}" stroke-width="1"/>')
                svg.append(f'<text x="{p_left - 6}" y="{y_p + 4}" fill="{text_subtext}" font-size="10" font-family="monospace" text-anchor="end">{y_v:.2f}</text>')

            # Grouped Bars for Models
            n_models = len(models_name)
            group_w = pw / n_models
            bar_w = group_w * 0.35

            for m_i in range(n_models):
                gx = p_left + m_i * group_w + group_w * 0.15
                
                # Acc bar
                acc_val = models_acc[m_i]
                acc_h = ((acc_val - 0.60) / 0.40) * ph
                acc_y = p_bottom - acc_h
                svg.append(f'<rect x="{gx}" y="{acc_y}" width="{bar_w}" height="{acc_h}" fill="{c_train}" rx="2"/>')
                
                # F1 bar
                f1_val = models_f1[m_i]
                f1_h = ((f1_val - 0.60) / 0.40) * ph
                f1_y = p_bottom - f1_h
                svg.append(f'<rect x="{gx + bar_w + 2}" y="{f1_y}" width="{bar_w}" height="{f1_h}" fill="{c_val}" rx="2"/>')

                # X label
                svg.append(f'<text x="{gx + bar_w}" y="{p_bottom + 14}" fill="{text_dark}" font-size="9" font-weight="600" text-anchor="middle">{models_name[m_i]}</text>')

            # Subplot Legend
            lx = p_left + 8
            ly = p_top + 4
            svg.append(f'<rect x="{lx}" y="{ly}" width="{65}" height="{28}" fill="#ffffff" stroke="{border_color}" stroke-width="0.8" rx="3" opacity="0.95"/>')
            svg.append(f'<rect x="{lx+5}" y="{ly+5}" width="10" height="8" fill="{c_train}" rx="1"/>')
            svg.append(f'<text x="{lx+18}" y="{ly+12}" fill="{text_dark}" font-size="9" font-weight="600">Accuracy</text>')
            svg.append(f'<rect x="{lx+5}" y="{ly+16}" width="10" height="8" fill="{c_val}" rx="1"/>')
            svg.append(f'<text x="{lx+18}" y="{ly+23}" fill="{text_dark}" font-size="9" font-weight="600">F1-Score</text>')

    svg.append('</svg>')

    os.makedirs("public", exist_ok=True)
    svg_content = "\n".join(svg)
    with open("public/ml_academic_white_grid.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)

    print("Successfully generated public/ml_academic_white_grid.svg")

if __name__ == "__main__":
    generate_white_academic_svg()
