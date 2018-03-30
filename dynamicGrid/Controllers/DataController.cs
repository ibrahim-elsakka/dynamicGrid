using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace dynamicGrid.Controllers
{
    [Produces("application/json")]
    [Route("api/Data")]
    public class DataController : Controller
    {
        [HttpPost]
        [Route("GetDataTable")]
        public IActionResult GetDataTable()
        {
            var dataTable = new System.Data.DataTable();
            dataTable.Columns.Add("Col1");
            dataTable.Columns.Add("Col2");
            dataTable.Columns.Add("Col3");
            dataTable.Columns.Add("Col4");
            dataTable.Columns.Add("Col5");
            for (var x = 0; x < 10; x++)
            {
                var newRow = dataTable.NewRow();
                newRow["Col1"] = "Sample";
                newRow["Col2"] = "Test";
                newRow["Col3"] = 100;
                newRow["Col4"] = 19.024;
                newRow["Col5"] = x;
                dataTable.Rows.Add(newRow);
            }
            return Ok(dataTable);
        }
        [HttpPost]
        [Route("GetDataObject")]
        public IActionResult GetDataObject()
        {
            var dataObject = new SampleDataObject { id = 1, Col1 = "First", Col2 = "Second" };
            var result = new List<dynamic>();
            result.Add(dataObject);
            return Ok(result);
        }

        [HttpPost]
        [Route("GetDataArray")]
        public IActionResult GetDataArray()
        {
            var result = new List<dynamic>();
            for (var x = 0; x < 10; x++)
            {
                var dataObject = new SampleDataObject { id = 1, Col1 = "First", Col2 = "Second", Col3 = x, Col4 = (x % 2 == 0) };
                result.Add(dataObject);
            }
            return Ok(result);
        }

        public class SampleDataObject
        {
            public int id { get; set; }
            public string Col1 { get; set; }
            public string Col2 { get; set; }
            public int Col3 { get; set; }
            public bool Col4 { get; set; }
        }
    }
}