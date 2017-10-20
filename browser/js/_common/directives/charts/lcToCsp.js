app.directive('cspchart', () => {
    return {
        restrict: 'A',
        scope: {
            csp: '='
        },
        link: (scope, element, attrs) => {
            let csp = Object.values(scope.csp)
            console.log('hello', csp)
            let ctx = document.getElementById('lcToCsp').getContext('2d')
            let myChart = new Chart(ctx, {
                type: 'horizontalBar',
                data: {
                    labels: csp.map(a => a.username),
                    datasets: [{
                        label: '# of Lcs',
                        data: csp.map(a => a.lcCount),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }
    }
})