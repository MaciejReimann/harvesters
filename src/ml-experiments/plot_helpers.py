import numpy as np
import matplotlib.pyplot as plt
# from matplotlib.ticker import MaxNLocator
# from matplotlib.gridspec import GridSpec
# from matplotlib.colors import LinearSegmentedColormap

plt.style.use('./deeplearning.mplstyle')
dlblue = '#0096ff'
dlorange = '#FF9300'
dldarkred = '#C00000'
dlmagenta = '#FF40FF'
dlpurple = '#7030A0'
dlcolors = [dlblue, dlorange, dldarkred, dlmagenta, dlpurple]
dlc = dict(dlblue='#0096ff', dlorange='#FF9300', dldarkred='#C00000',
           dlmagenta='#FF40FF', dlpurple='#7030A0')


def plot_areas_to_prices(x_training_examples, y_training_examples, f_wb=None):
    fig, ax = plt.subplots(1, 1)

    ax.scatter(x_training_examples, y_training_examples,
               marker="o", c="b", label="Actual Value")
    ax.set_title("Property prices in Sassari province")
    ax.set_xlabel("Area in m2")
    ax.set_ylabel("Price in 1000 EUR")

    if (f_wb is not None):
        ax.plot(x_training_examples, f_wb, c="r", label="Our prediction")
    ax.legend()

    # x = np.linspace(0, 400, 100)
    # y = x ** 2

    # plt.plot(x, y, "r")

    plt.show()


def draw_cost_lines(x, y, w, b, ax):
    color = "b"
    cstr = "cost = (1/m)*("
    ctot = 0
    label = 'cost for point'
    addedbreak = False

    for p in zip(x, y):
        f_wb_p = w*p[0]+b
        c_p = ((f_wb_p - p[1])**2)/2
        c_p_txt = c_p
        ax.vlines(p[0], p[1], f_wb_p, lw=3,
                  color=color, ls='dotted', label=label)
        label = ''  # just one
        cxy = [p[0], p[1] + (f_wb_p-p[1])/2]
        ax.annotate(f'{c_p_txt:0.0f}', xy=cxy, xycoords='data', color=color,
                    xytext=(5, 0), textcoords='offset points')
        cstr += f"{c_p_txt:0.0f} +"
        if len(cstr) > 38 and addedbreak is False:
            cstr += "\n"
            addedbreak = True
        ctot += c_p
    ctot = ctot/(len(x))
    cstr = cstr[:-1] + f") = {ctot:0.0f}"
    ax.text(0.15, 0.02, cstr, transform=ax.transAxes, color=color)


def plot_dynamically(x_training_examples, y_training_examples):
    w_range = numpy.array([200-200, 200+200])
    w_values = numpy.arange(*w_range, 5)
    b = 0

    costs = []
    for w_value in w_values:
        cost = compute_cost(x_training_examples,
                            y_training_examples, w_value, b)

        costs.append(cost)

    @interact(w=(*w_range, 10), continuous_update=False)
    def zeros_like(w=150):
        f_wb = numpy.dot(x_training_examples, w) + b

        fig, ax = plt.subplots(1, 2, constrained_layout=True, figsize=(8, 4))
        fig.canvas.toolbar_position = 'bottom'

        draw_cost_lines(x_training_examples, y_training_examples, w, b, ax[0])
        plot_areas_to_prices(x_training_examples,
                             y_training_examples, f_wb=f_wb, ax=ax[0])

        ax[1].plot(w_values, costs)

        cur_cost = compute_cost(x_training_examples,
                                y_training_examples, w, b)

        ax[1].scatter(w, cur_cost, s=100, color="r",
                      zorder=10, label=f"cost at w={w}")
        ax[1].hlines(cur_cost, ax[1].get_xlim()[0], w,
                     lw=4, color="b", ls='dotted')
        ax[1].vlines(w, ax[1].get_ylim()[0], cur_cost,
                     lw=4, color="b", ls='dotted')
        ax[1].set_title("Cost vs. w, (b fixed at 100)")
        ax[1].set_ylabel('Cost')
        ax[1].set_xlabel('w')
        ax[1].legend(loc='upper center')
        fig.suptitle(
            f"Minimize Cost: Current Cost = {cur_cost:0.0f}", fontsize=12)
        plt.show()
