from flask import Flask, send_file

app = Flask(__name__)


@app.route("/pt-utilities", methods=["GET"])
def pt_utilities():
    return send_file("./pt-utilities.js")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=80)
